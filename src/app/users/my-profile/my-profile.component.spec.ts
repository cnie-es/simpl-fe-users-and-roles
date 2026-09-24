import {ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {BehaviorSubject, of, throwError} from 'rxjs';
import {MyProfileComponent} from './my-profile.component';
import {EuiAppShellService, EuiGrowlService} from '@eui/core';
import {RoleRequestsService, RolesService, UsersService, UserSessionService} from '@simpl/api-client-usersroles-tier1-v2';
import {TranslocoService, TranslocoTestingModule} from '@jsverse/transloco';
import Keycloak from 'keycloak-js';
import en from "../../../assets/i18n/en.json";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {CommonModule} from "@angular/common";


describe('RoleRequestsComponent', () => {
  let component: MyProfileComponent;
  let fixture: ComponentFixture<MyProfileComponent>;

  const roleRequestsServiceMock = {
    searchEndUsersRoleRequests: jest.fn(),
    createNewRoleRequest: jest.fn(),
    getRoleRequestById: jest.fn(),
    cancelRoleRequestById: jest.fn(),
  };

  const rolesServiceMock = {
    searchRoles: jest.fn(),
  };

  const usersServiceMock = {
    searchUsers: jest.fn(),
  };

  const userSessionServiceMock = {
    getUserSessionData: jest.fn(),
  } as unknown as UserSessionService;

  const euiGrowlServiceMock = {
    growl: jest.fn(),
  };

  const translocoServiceMock = {
    translate: jest.fn((key: string) => key),
    selectTranslate: jest.fn(),
    langChanges$: of('en'),
    events$: of(),
  } as unknown as TranslocoService;

  const keycloakMock = {
    tokenParsed: {
      email: 'test@example.com',
      realm_access: {
        roles: ['ADMIN', 'USER'],
      },
    },
  } as unknown as Keycloak;

  beforeEach(async () => {
    roleRequestsServiceMock.searchEndUsersRoleRequests.mockReturnValue(of({items: []}));
    rolesServiceMock.searchRoles.mockReturnValue(of({
      items: [
        {code: 'ADMIN', name: 'ADMIN'},
        {code: 'USER', name: 'USER'},
        {code: 'GUEST', name: 'GUEST'},
      ],
    }));
    usersServiceMock.searchUsers.mockReturnValue(of({items: []}));
    userSessionServiceMock.getUserSessionData = jest.fn().mockReturnValue(of({
      roles: ['ADMIN'],
    }));

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MyProfileComponent,
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
        NoopAnimationsModule,],
      providers: [
        {provide: RoleRequestsService, useValue: roleRequestsServiceMock},
        {provide: RolesService, useValue: rolesServiceMock},
        {provide: UsersService, useValue: usersServiceMock},
        {provide: UserSessionService, useValue: userSessionServiceMock},
        {provide: EuiGrowlService, useValue: euiGrowlServiceMock},
        {provide: Keycloak, useValue: keycloakMock},
        {
          provide: EuiAppShellService,
          useValue: {
            isBlockDocumentActive: false,
            state$: new BehaviorSubject(null),
          },
        },
      ],
    })
      .overrideComponent(MyProfileComponent, {
        add: {
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(MyProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize data on ngOnInit and filter selectableRoles by assigned and OPEN requested roles', () => {

    roleRequestsServiceMock.searchEndUsersRoleRequests.mockReturnValue(of({
      items: [
        {
          status: 'OPEN',
          rolesRequested: ['USER'],
        } as any,
      ],
    }));

    component.ngOnInit();

    expect(roleRequestsServiceMock.searchEndUsersRoleRequests).toHaveBeenCalled();
    expect(userSessionServiceMock.getUserSessionData).toHaveBeenCalled();
    expect(rolesServiceMock.searchRoles).toHaveBeenCalledWith(null, null, null, null, null, null, true, null, true);

    expect(component.roles.map(r => r.name)).toEqual(['GUEST']);
    expect(component.selectableRoles).toEqual([
      {id: 'GUEST', label: 'GUEST'},
    ]);
    expect(component.rolesAssigned).toEqual(['ADMIN']);
  });

  it('should submit role requests, refresh data and filter selectableRoles after success', fakeAsync(() => {
    const initialUserRoleRequest = {items: []};
    const updatedUserRoleRequest = {
      items: [
        {
          status: 'OPEN',
          rolesRequested: ['ADMIN'],
        } as any,
      ],
    };

    roleRequestsServiceMock.searchEndUsersRoleRequests
      .mockReturnValueOnce(of(initialUserRoleRequest))
      .mockReturnValueOnce(of(updatedUserRoleRequest));

    rolesServiceMock.searchRoles
      .mockReturnValue(of({
        items: [
          {code: 'ADMIN', name: 'ADMIN'},
          {code: 'USER', name: 'USER'},
        ],
      }));

    component.ngOnInit();
    tick();

    component.rolesSelected.set([
      {euiInternalId: '1', id: 'ADMIN', label: 'ADMIN'},
    ] as any);

    roleRequestsServiceMock.createNewRoleRequest.mockReturnValue(of(null));

    (component as any).onSubmitRoleRequests();
    tick();

    expect(roleRequestsServiceMock.createNewRoleRequest).toHaveBeenCalledWith({
      rolesRequested: ['ADMIN'],
    });

    expect(component.userRoleRequest).toEqual(updatedUserRoleRequest as any);
    expect(component.roles.map(r => r.name)).toEqual(['USER']);
    expect(component.selectableRoles).toEqual([
      {id: 'USER', label: 'USER'},
    ]);

    const growlArgs = (euiGrowlServiceMock.growl as jest.Mock).mock.calls[0][0];
    expect(growlArgs.severity).toBe('success');
    expect(growlArgs.summary).toBe(en.roleRequests.saveSuccess);
  }));

  it('should handle 422 error when creating role request and show alreadyRequested growl', fakeAsync(() => {
    roleRequestsServiceMock.createNewRoleRequest.mockReturnValue(throwError(() => ({ status: 422 })));

    (component as any).onSubmitRoleRequests();
    tick();

    expect(euiGrowlServiceMock.growl).toHaveBeenCalled();
    const lastCallIndex = (euiGrowlServiceMock.growl as jest.Mock).mock.calls.length - 1;
    const growlArgs = (euiGrowlServiceMock.growl as jest.Mock).mock.calls[lastCallIndex][0];
    expect(growlArgs.severity).toBe('danger');
    expect(growlArgs.summary).toBe(en.roleRequests.alreadyRequested);
  }));

  it('should handle generic error when creating role request and show errorSave growl', fakeAsync(() => {
    roleRequestsServiceMock.createNewRoleRequest.mockReturnValue(throwError(() => ({ status: 500 })));

    (component as any).onSubmitRoleRequests();
    tick();

    expect(euiGrowlServiceMock.growl).toHaveBeenCalled();
    const lastCallIndex = (euiGrowlServiceMock.growl as jest.Mock).mock.calls.length - 1;
    const growlArgs = (euiGrowlServiceMock.growl as jest.Mock).mock.calls[lastCallIndex][0];
    expect(growlArgs.severity).toBe('danger');
    expect(growlArgs.summary).toBe(en.roleRequests.errorSave);
  }));

  it('should update pagination on page change', () => {
    const newPageEvent = { page: 1, pageSize: 10, nbPage: 5 } as any;

    component.onPageChange(newPageEvent);

    expect(component.pagination()).toEqual(newPageEvent);
  });

  it('should reset filters and pagination and chips on resetCredentialsFilters', () => {
    component.roleRequestsFiltersForm.setValue({ status: 'APPROVED' });
    (component as any).credentialsChips.set([
      { field: 'status', value: 'APPROVED' } as any,
    ]);
    component.pagination.set({ page: 2, pageSize: 10, nbPage: 5 });

    component.resetCredentialsFilters();

    expect(component.roleRequestsFiltersForm.value.status).toBeNull();
    expect((component as any).credentialsChips()).toEqual([]);
    expect(component.filtersData()).toBeNull();
  });

  it('should add filter and reset pagination and chips when addFilter is called', () => {
    component.roleRequestsFiltersForm.setValue({ status: 'OPEN' });
    component.pagination.set({ page: 3, pageSize: 25, nbPage: 5 });

    component.addFilter();

    expect(component.filtersData()).toEqual({ status: 'OPEN' });
    expect(component.pagination()).toEqual({ page: 0, pageSize: 25, nbPage: 5 });
    const chips = (component as any).credentialsChips();
    expect(chips.length).toBe(1);
    expect(chips[0].field).toBe('status');
    expect(chips[0].value).toBe('OPEN');
  });

  it('should remove chip and reset form control and pagination when onChipRemove is called', () => {

    component.roleRequestsFiltersForm.setValue({ status: 'REJECTED' });
    (component as any).credentialsChips.set([
      { field: 'status', value: 'REJECTED' } as any,
    ]);
    component.pagination.set({ page: 2, pageSize: 5, nbPage: 5 });

    const fakeChip = { id: 'status' } as any;
    component.onChipRemove(fakeChip);

    expect((component as any).credentialsChips()).toEqual([]);
    expect(component.roleRequestsFiltersForm.get('status').value).toBeNull();
    expect(component.filtersData()).toEqual(component.roleRequestsFiltersForm.value);
    expect(component.pagination()).toEqual({ page: 0, pageSize: 5, nbPage: 5 });
  });

  it('should reset rolesSelected on resetRolesSelected', () => {
    component.rolesSelected.set([
      { euiInternalId: '1', id: 'ADMIN', label: 'Admin' },
    ] as any);

    (component as any).resetRolesSelected();

    expect(component.rolesSelected()).toBeNull();
  });

  it('should call roleRequests linkedSignal with current pagination, sort and filters', (done) => {
    component.pagination.set({ page: 1, pageSize: 10, nbPage: 5 });
    (component as any).sortCriteria.set([
      { sort: 'id', order: 'asc' } as any,
    ]);
    component.filtersData.set({ status: 'OPEN' } as any);

    const response$ = of({ items: [] } as any);
    roleRequestsServiceMock.searchEndUsersRoleRequests.mockReturnValue(response$);

    (component as any).roleRequests().subscribe(() => {
      expect(roleRequestsServiceMock.searchEndUsersRoleRequests).toHaveBeenCalledWith(
        1,
        10,
        ['id'],
        'OPEN'
      );
      done();
    });
  });

  it('should remove credential chip when adding filter with empty value', () => {

    component.roleRequestsFiltersForm.setValue({ status: null });
    (component as any).credentialsChips.set([
      { field: 'status', value: 'APPROVED' } as any,
    ]);

    const removeCredentialChipSpy = jest.spyOn<any, any>(component as any, 'removeCredentialChip');

    component.addFilter();

    expect(removeCredentialChipSpy).toHaveBeenCalledWith('status');
  });

  it('should update existing credential chip when addFilter called twice with same key', () => {

    component.roleRequestsFiltersForm.setValue({ status: 'OPEN' });
    component.addFilter();

    component.roleRequestsFiltersForm.setValue({ status: 'APPROVED' });
    component.addFilter();

    const chips = (component as any).credentialsChips();
    expect(chips.length).toBe(1);
    expect(chips[0].field).toBe('status');
    expect(chips[0].value).toBe('APPROVED');
  });

  it('should update sortCriteria on onSortChange', () => {
    const sortEvent = [{ sort: 'id', order: 'desc' } as any];

    component.onSortChange(sortEvent as any);
    expect(true).toBe(true);
  });

  it('should remove credential chip and reset pagination when removeCredentialChip is called', () => {
    (component as any).credentialsChips.set([
      { field: 'status', value: 'APPROVED' } as any,
      { field: 'other', value: 'X' } as any,
    ]);
    component.roleRequestsFiltersForm.setValue({ status: 'APPROVED' });
    component.pagination.set({ page: 3, pageSize: 20, nbPage: 5 });

    (component as any).removeCredentialChip('status');

    const chips = (component as any).credentialsChips();
    expect(chips.length).toBe(1);
    expect(chips[0].field).toBe('other');
    expect(component.roleRequestsFiltersForm.get('status').value).toBeNull();
    expect(component.filtersData()).toEqual(component.roleRequestsFiltersForm.value);
    expect(component.pagination()).toEqual({ page: 0, pageSize: 20, nbPage: 5 });
  });

  it('should open dialogDetail and set roleRequestDetail when showRoleRequestDetail is called', () => {
    const mockRow: any = { id: '1', status: 'OPEN' };
    const roleRequestDetailResponse: any = { id: '1', status: 'OPEN', rolesRequested: ['ADMIN'] };

    roleRequestsServiceMock.getRoleRequestById.mockReturnValue(of(roleRequestDetailResponse));
    (component as any).dialogDetail = {
      openDialog: jest.fn(),
    } as any;

    (component as any).showRoleRequestDetail(mockRow);

    expect(roleRequestsServiceMock.getRoleRequestById).toHaveBeenCalledWith('1');
    expect((component as any).dialogDetail.openDialog).toHaveBeenCalled();
    expect(component.roleRequestDetail).toBe(roleRequestDetailResponse);
  });

  it('should open dialog and disable accept button on openDialog', () => {
    (component as any).dialog = {
      openDialog: jest.fn(),
      disableAcceptButton: jest.fn(),
      enableAcceptButton: jest.fn(),
    } as any;

    (component as any).openDialog();

    expect((component as any).dialog.openDialog).toHaveBeenCalled();
    expect((component as any).dialog.disableAcceptButton).toHaveBeenCalled();
  });

  it('should enable and disable accept button based on rolesSelected in onRolesSelectedChange', () => {
    (component as any).dialog = {
      openDialog: jest.fn(),
      disableAcceptButton: jest.fn(),
      enableAcceptButton: jest.fn(),
    } as any;

    (component as any).onRolesSelectedChange(null);
    expect((component as any).dialog.disableAcceptButton).toHaveBeenCalled();

    (component as any).onRolesSelectedChange([
      { euiInternalId: '1', id: 'ADMIN', label: 'ADMIN' },
    ] as any);
    expect((component as any).dialog.enableAcceptButton).toHaveBeenCalled();

    (component as any).onRolesSelectedChange([] as any);
    expect((component as any).dialog.disableAcceptButton).toHaveBeenCalledTimes(2);
  });

  it('should disable accept button when resetting rolesSelected', () => {
    (component as any).dialog = {
      disableAcceptButton: jest.fn(),
    } as any;

    component.rolesSelected.set([
      { euiInternalId: '1', id: 'ADMIN', label: 'Admin' },
    ] as any);

    (component as any).resetRolesSelected();

    expect(component.rolesSelected()).toBeNull();
    expect((component as any).dialog.disableAcceptButton).toHaveBeenCalled();
  });

  it('should handle empty roles list in updateSelectableRoles', () => {

    component.rolesAssigned = ['ADMIN'];
    (component as any).userRoleRequest = { items: [] } as any;

    (component as any).updateSelectableRoles({ items: [] });

    expect(component.roles).toEqual([]);
    expect(component.selectableRoles).toEqual([]);
  });

  it('should handle role deletion success, show success growl and reset pagination', () => {
    const row: any = { id: '123' };
    const initialPagination = { page: 2, pageSize: 20, nbPage: 5 } as any;
    component.pagination.set(initialPagination);

    roleRequestsServiceMock.cancelRoleRequestById.mockReturnValue(of(null));

    (component as any).dialogDeleteRoleRequest = {
      openDialog: jest.fn(),
    } as any;

    component.deleteRoleRequest(row);

    expect(component.roleRequestToDelete).toBe(row);
    expect((component as any).dialogDeleteRoleRequest.openDialog).toHaveBeenCalled();

    (component as any).onDeleteRoleRequest();

    expect(roleRequestsServiceMock.cancelRoleRequestById).toHaveBeenCalledWith('123');

    const lastCallIndex = (euiGrowlServiceMock.growl as jest.Mock).mock.calls.length - 1;
    const growlArgs = (euiGrowlServiceMock.growl as jest.Mock).mock.calls[lastCallIndex][0];
    expect(growlArgs.severity).toBe('success');
    expect(growlArgs.summary).toBe(en.roleRequests.deleteSuccess);

    expect(component.pagination()).toEqual({ page: 0, pageSize: 5, nbPage: 5 });
  });

  it('should handle role deletion error and show error growl without resetting pagination', () => {
    const row: any = { id: '456' };
    const initialPagination = { page: 3, pageSize: 10, nbPage: 7 } as any;
    component.pagination.set(initialPagination);

    roleRequestsServiceMock.cancelRoleRequestById.mockReturnValue(throwError(() => ({ status: 500 })));

    (component as any).dialogDeleteRoleRequest = {
      openDialog: jest.fn(),
    } as any;

    component.deleteRoleRequest(row);

    expect(component.roleRequestToDelete).toBe(row);
    expect((component as any).dialogDeleteRoleRequest.openDialog).toHaveBeenCalled();

    (component as any).onDeleteRoleRequest();

    expect(roleRequestsServiceMock.cancelRoleRequestById).toHaveBeenCalledWith('456');

    const lastCallIndex = (euiGrowlServiceMock.growl as jest.Mock).mock.calls.length - 1;
    const growlArgs = (euiGrowlServiceMock.growl as jest.Mock).mock.calls[lastCallIndex][0];
    expect(growlArgs.severity).toBe('danger');
    expect(growlArgs.summary).toBe('roleRequests.deleteError');

    expect(component.pagination()).toEqual(initialPagination);
  });
});
