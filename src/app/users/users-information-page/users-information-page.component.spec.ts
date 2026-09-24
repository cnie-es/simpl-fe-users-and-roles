import {ComponentFixture, TestBed} from '@angular/core/testing';
import {UsersInformationPageComponent} from './users-information-page.component';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule, HttpTestingController,} from '@angular/common/http/testing';
import {CommonModule} from '@angular/common';
import {of, throwError} from 'rxjs';
import {UsersService} from '../users.service';
import {MatDialog} from '@angular/material/dialog';
import {provideHttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {User} from '@simpl/api-client-usersroles-tier1-v2';
import {EuiChip} from '@eui/components/eui-chip';
import {API_URL} from "@shared/tokens";
import en from "../../../assets/i18n/en.json"
import {EuiDialogService} from "@eui/components/eui-dialog";
import {EuiGrowlService} from "@eui/core";

describe('UsersInformationPageComponent', () => {
  let component: UsersInformationPageComponent;
  let fixture: ComponentFixture<UsersInformationPageComponent>;
  let httpTestingController: HttpTestingController;
  const mockApiUrl = 'http://mock-api-url';
  const mockUsersService = {
    getUserRoles: jest.fn().mockReturnValue(of([])),
    getUserList: jest.fn().mockReturnValue(of([])),
    deleteUser: jest.fn().mockReturnValue(of([]))
  };

  const mockDialog = {
    open: jest.fn().mockReturnValue({
      afterClosed: jest.fn().mockReturnValue(of(true)),
    }),
  };

    const mockDialogService = {
        openDialog: jest.fn(),
    };

    const mockGrowlService = {
        growl: jest.fn(),
    };

    beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        UsersInformationPageComponent,
        HttpClientTestingModule,
        TranslocoTestingModule.forRoot(
          {
            translocoConfig: {
              availableLangs: ["en"],
              defaultLang: "en",
            },
            langs: {
              en: en
            }
          }
        ),
        NoopAnimationsModule,
      ],
      providers: [
        provideHttpClient(),
        { provide: UsersService, useValue: mockUsersService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ActivatedRoute, useValue: { snapshot: {} } },
        {provide: EuiDialogService, useValue: mockDialogService},
        {provide: EuiGrowlService, useValue: mockGrowlService},
        { provide: API_URL, useValue: mockApiUrl },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersInformationPageComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getUserRoles, toggle loading, and open dialog when showUserRoles is called', () => {
    const mockRow = { id: '123' };
    const mockRoles = [{ id: 'role1', name: 'Admin' }];
    mockUsersService.getUserRoles.mockReturnValue(of(mockRoles));

    component.showUserRoles(mockRow as User);

    expect(mockUsersService.getUserRoles).toHaveBeenCalledWith(mockRow.id);
    expect(component.loading).toBeTruthy();
    setTimeout(() => {
      expect(component.loading).toBeFalsy();
      expect(component.roleDialogData.roles).toEqual(mockRoles as any);
      expect(mockDialog.open).toHaveBeenCalled();
    }, 0);
  });
  describe('search', () => {
    it('should set loading to true', () => {
      component.search();
      expect(component.loading).toBeTruthy();
    });

    it('should call updateChips', () => {
      const updateChipsSpy = jest.spyOn(component, 'updateChips');
      component.search();
      expect(updateChipsSpy).toHaveBeenCalled();
    });
  });

  describe('updateChips', () => {
    it('should populate the chips array based on form controls with values', () => {
      component.filtersForm.setValue({
        username: 'testUser',
        email: 'test@example.com',
        firstName: '',
        lastName: '',
      });

      component.updateChips();

      expect(component.chips).toEqual([
        { field: 'email', value: 'test@example.com' },
        { field: 'username', value: 'testUser' },
      ]);
    });

    it('should result in an empty chips array when all form controls are empty', () => {
      component.filtersForm.setValue({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
      });

      component.updateChips();

      expect(component.chips).toEqual([]);
    });
  });

  it('should update pagination and calculate paginatedItems in onPageChange', () => {
    const mockEvent = { page: 1, pageSize: 2, nbPage: 3 };
    component.data.items = [
      { id: '1', username: 'user1' },
      { id: '2', username: 'user2' },
      { id: '3', username: 'user3' },
      { id: '4', username: 'user4' },
    ] as User[];

    component.onPageChange(mockEvent);
    expect(component.pagination).toEqual(mockEvent);
  });

  it('should update filters form and call search when a chip is removed', () => {
    const mockEvent = { id: 'username' } as EuiChip;

    component.filtersForm.setValue({
      username: 'sampleUser',
      email: '',
      firstName: '',
      lastName: '',
    });

    const searchSpy = jest.spyOn(component, 'search');
    component.removeChip(mockEvent);
    expect(component.filtersForm.get('username')?.value).toBe(null);
    expect(searchSpy).toHaveBeenCalled();
  });

  it('should reset all filters and trigger a search when resetFilters is called', () => {
    component.filtersForm.setValue({
      username: 'sampleUser',
      email: 'email@example.com',
      firstName: 'John',
      lastName: 'Doe',
    });

    const searchSpy = jest.spyOn(component, 'search');
    component.resetFilters();

    expect(component.filtersForm.value).toEqual({
      username: null,
      email: null,
      firstName: null,
      lastName: null,
    });
    expect(searchSpy).toHaveBeenCalled();
  });

  it('should navigate to user creation page when navigateToUserCreation is called', () => {
    const routerSpy = jest.spyOn(component['router'], 'navigate');
    component.navigateToUserCreation();

    expect(routerSpy).toHaveBeenCalledWith(['/users/new-user'], {
      relativeTo: component['route'],
    });
  });
  describe('onDeleteUser', () => {
    it('should open confirmation dialog when onDeleteUser is called', () => {
      const mockUser: User = {id: '1', username: 'testUser'} as User;

      component.onDeleteUser(mockUser);

      expect(mockDialogService.openDialog).toHaveBeenCalled();
    });

    it('should call deleteUser and display success growl on confirmation', () => {
      const mockUser: User = {id: '1', username: 'testUser'} as User;
      const deleteUserSpy = jest.spyOn(mockUsersService, 'deleteUser').mockReturnValue(of(null));
      const searchSpy = jest.spyOn(component, 'search');

      mockDialogService.openDialog.mockImplementation((config) => {
        config.accept();
      });

      component.onDeleteUser(mockUser);

      expect(deleteUserSpy).toHaveBeenCalledWith(mockUser.id);
      expect(mockGrowlService.growl).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'success',
        })
      );
      expect(searchSpy).toHaveBeenCalled();
    });

    it('should display error growl on delete failure', () => {
      const mockUser: User = {id: '1', username: 'testUser'} as User;
      jest.spyOn(mockUsersService, 'deleteUser').mockReturnValue(throwError(() => new Error('Error')));

      mockDialogService.openDialog.mockImplementation((config) => {
        config.accept();
      });

      component.onDeleteUser(mockUser);

      expect(mockGrowlService.growl).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'danger',
        })
      );
    });
  });
});


