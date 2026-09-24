import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {EditUserComponent} from './edit-user.component';
import {TranslateModule} from "@ngx-translate/core";
import {ComponentRef, NO_ERRORS_SCHEMA} from "@angular/core";
import {BehaviorSubject, of} from "rxjs";
import {EuiAppShellService, EuiGrowlService} from "@eui/core";
import {provideRouter} from "@angular/router";
import {EUI_PAGE} from "@eui/components/eui-page";
import {
  RolesService as RolesServiceApi,
  UsersService as UsersServiceApi
} from '@simpl/api-client-usersroles-tier1-v2';

describe('EditUserComponent', () => {
  let component: EditUserComponent;
  let fixture: ComponentFixture<EditUserComponent>;
  let componentRef: ComponentRef<EditUserComponent>;

  const mockUser = {
    id: 'testUserId',
    email: 'test@user.com',
    firstName: 'John',
    lastName: 'Doe',
    username: 'John Doe',
    enabled: true,
    roles: ['ADMIN'],
  }

  let usersServiceMock  = {
    getUserById: jest.fn().mockReturnValue(of(mockUser)),
    updateUserById: jest.fn(),
  };
  let rolesServiceMock = {
    searchRoles: jest.fn().mockReturnValue(of({
      items: [{code: 'ADMIN', name: 'Admin'}, {
        code: 'USER',
        name: 'User'
      }, {code: 'GUEST', name: 'Guest'}]
    })),
  };

  const euiGrowlServiceMock = {
    growl: jest.fn(),
  };
  const translateServiceMock = {
    instant: jest.fn(),
  };



  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditUserComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        {provide: EuiGrowlService, useValue: euiGrowlServiceMock},
        {provide: UsersServiceApi, useValue: usersServiceMock},
        {provide: RolesServiceApi, useValue: rolesServiceMock},
        {
          provide: EuiAppShellService, useValue: {
            state$: new BehaviorSubject(null)
          }
        },
      ]
    }).overrideComponent(EditUserComponent, {
      add: {
        schemas: [NO_ERRORS_SCHEMA],
      },
      remove: {
        imports: [...EUI_PAGE]
      }
    })
      .compileComponents();

    fixture = TestBed.createComponent(EditUserComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('id', 'testUserId');
    fixture.detectChanges();
  });

  it('should create', () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
  });

    it('should successfully update the user and navigate to /users', fakeAsync(() => {
        const routerNavigateSpy = jest.spyOn(component.router, 'navigate').mockReturnValue(Promise.resolve(true));
        const updatedUserDetails = {
            email: 'updated@user.com',
            firstName: 'Jane',
            lastName: 'Smith',
            username: 'Jane Smith',
            enabled: false,
            roles: [{id: 'USER', label: 'USER'}],
        };

        component.userForm.setValue(updatedUserDetails);
        usersServiceMock.updateUserById.mockReturnValue(of(null));

        component.saveUser();
        tick();

        expect(usersServiceMock.updateUserById).toHaveBeenCalledWith('testUserId', {
            ...updatedUserDetails,
            roles: ['USER'],
        });
        expect(euiGrowlServiceMock.growl).toHaveBeenCalledWith(expect.objectContaining({severity: 'success',}));
        expect(routerNavigateSpy).toHaveBeenCalledWith(['/users']);
    }));

    it('should fetch roles and update allRoles on ngOnInit', () => {
    const expectedRoles = [
      {id: 'ADMIN', label: 'Admin'},
      {id: 'USER', label: 'User'},
      {id: 'GUEST', label: 'Guest'},
    ];

    component.ngOnInit();

    expect(rolesServiceMock.searchRoles).toHaveBeenCalledWith(null, null, null, null, null, null, null, null, true);
    expect(component.allRoles()).toEqual(expectedRoles);
  });

  it('should load user data and initialize userForm on ngOnInit', fakeAsync(() => {
    const expectedUserFormValue = {
      email: 'test@user.com',
      firstName: 'John',
      lastName: 'Doe',
      username: 'John Doe',
      enabled: true,
      roles: [{id: 'ADMIN', label: 'ADMIN'}],
    };

    component.ngOnInit();
    tick(100)
    expect(usersServiceMock.getUserById).toHaveBeenCalledWith('testUserId');
    expect(component.userForm.value).toEqual(expectedUserFormValue);
    expect(component.userForm.valid).toBeTruthy();
  }));
});
