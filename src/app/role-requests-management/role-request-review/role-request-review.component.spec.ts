import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleRequestReviewComponent } from './role-request-review.component';
import {provideRouter} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {RoleRequestDetailComponent} from "../role-request-detail/role-request-detail.component";
import {RoleRequestsService, RolesService, UsersService} from "@simpl/api-client-usersroles-tier1-v2";
import {EuiAppShellService, EuiGrowlService} from "@eui/core";
import {ComponentRef, NO_ERRORS_SCHEMA} from "@angular/core";
import {BehaviorSubject, of, throwError} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {fakeAsync, flush} from "@angular/core/testing";

describe('RoleRequestReviewComponent', () => {
  let component: RoleRequestReviewComponent;
  let fixture: ComponentFixture<RoleRequestReviewComponent>;
  let ref: ComponentRef<RoleRequestReviewComponent>;

  const mockRoleRequest = {
    "id": "test-id",
    "createdBy": "test-norole1@fake.com",
    "status": "OPEN",
    "rolesRequested": [
      "SD_PUBLISHER"
    ],
    "rolesAssigned": [],
    "creationTimestamp": "2026-01-19T17:10:02.514228Z",
    "lastUpdateTimestamp": "2026-01-19T17:10:02.514236Z"
  }

  const mockAllRoles = [
    {
      "id": "Id1",
      "code": "test_Role1",
      "name": "test_Role1",
      "description": "${role_uma_authorization}",
      "builtIn": false,
      "enabled": true
    },
    {
      "id": "Id2",
      "code": "Test_Role2",
      "name": "Test_Role2",
      "description": "Tier 2 setup administrator role",
      "builtIn": false,
      "enabled": true
    },
    {
      "id": "Id3",
      "code": "Test_Role3",
      "name": "Test_Role3",
      "description": "Role defined for the ",
      "builtIn": false,
      "enabled": true
    },
    {
      "id": "Id4",
      "code": "Test_Role4",
      "name": "Test_Role4",
      "description": "Catalogue Reader",
      "builtIn": false,
      "enabled": true
    },
    {
      "id": "Id5",
      "code": "nuovotestv2",
      "name": "nuovotestv2",
      "description": "desc",
      "builtIn": false,
      "enabled": true
    }
  ]


  const mockRoleRequestsService = {
    getRoleRequestById: jest.fn().mockReturnValue(of(mockRoleRequest)),
    putRoleRequestById: jest.fn().mockReturnValue(of(true)),
  };
  const mockRolesService = {
    searchRoles: jest.fn().mockReturnValue(of(mockAllRoles))
  };
  const mockUsersService = {
    searchUsers: jest.fn().mockReturnValue(of({
      items: [{ id: 'user-1', roles: ['Test_Role2'] }],
    } as any)),
  };
  const mockAsService = {
    isBlockDocumentActive: true,
    state$: new BehaviorSubject({})
  };
  const mockGrowlService = {
    growlSuccess: jest.fn(),
    growlError: jest.fn(),
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleRequestReviewComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        {
          provide: RoleRequestsService,
          useValue: mockRoleRequestsService
        },
        {
          provide: RolesService,
          useValue: mockRolesService
        },
        {
          provide: UsersService,
          useValue: mockUsersService
        },
        {
          provide: EuiAppShellService,
          useValue: mockAsService
        },
        {
          provide: EuiGrowlService,
          useValue: mockGrowlService
        }
      ]
    }).overrideComponent(RoleRequestReviewComponent, {
      remove: {
        imports: [
          RoleRequestDetailComponent
        ]
      },
      add: {
        schemas: [NO_ERRORS_SCHEMA],
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleRequestReviewComponent);
    component = fixture.componentInstance;
    ref = fixture.componentRef;
    ref.setInput('id', 'test-id');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set selectedRole and calculate available roles onRoleSelected', () => {
    const mockEvent = [{ id: 'testRoile1', label: 'testRole1' }, { id: 'testRole2', label: 'testRole2' }];
    component.allRoles.set(mockAllRoles);
    (component as any).onRoleSelected(mockEvent);
    expect(component.selectedRoles()).toBe(mockEvent)
  });

  it('should load user roles (already assigned) from createdBy email on init', fakeAsync(() => {
    flush();
    expect(mockUsersService.searchUsers).toHaveBeenCalledWith(null, null, null, null, null, mockRoleRequest.createdBy);
    expect(component.roleAlreadyAssigned()).toEqual(['Test_Role2']);
  }));

  describe('submitRoleRequestReview - submits a review and triggers notifications/navigation', () => {
    it('submits APPROVED with selected role ids and navigates on success', () => {
      const routerSpy = jest.spyOn(component.router, 'navigate')
      component.selectedRoles.set([{ id: 'testRole1', label: 'testRole1' }, { id: 'testRole2', label: 'testRole2' }]);
      component.submitRoleRequestReview('APPROVED');
      expect(mockRoleRequestsService.putRoleRequestById).toHaveBeenCalledWith('test-id', {
        status: 'APPROVED',
        rolesAssigned: ['testRole1', 'testRole2']
      });
      expect(mockGrowlService.growlSuccess).toHaveBeenCalled();
      expect(routerSpy).toHaveBeenCalledWith(['/role-requests-management'])
    });

    it('submits REJECTED with no assigned roles', () => {
      component.selectedRoles.set([{ id: 'testRole1', label: 'testRole1' }, { id: 'testRole2', label: 'testRole2' }]);
      component.submitRoleRequestReview('REJECTED');
      expect(mockRoleRequestsService.putRoleRequestById).toHaveBeenCalledWith('test-id', {
        status: 'REJECTED',
        rolesAssigned: []
      });
    });

    it('shows an error growl when the API call fails', () => {
      mockRoleRequestsService.putRoleRequestById.mockReturnValueOnce(throwError(() => new HttpErrorResponse({status: 500})));
      component.selectedRoles.set([{ id: 'testRole1', label: 'testRole1' }, { id: 'testRole2', label: 'testRole2' }]);
      component.submitRoleRequestReview('APPROVED');
      expect(mockGrowlService.growlError).toHaveBeenCalled();
    });
  })
});
