import {ComponentFixture, TestBed} from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { RoleComponent } from './role.component';
import { RolesService } from '../roles.service';
import { Router } from '@angular/router';
import { TranslocoTestingModule, translocoConfig } from '@jsverse/transloco';
import { EuiGrowlService } from '@eui/core';
import { IdentityAttribute, Role } from '@simpl/api-client-usersroles-tier1-v2';
import { IdentityAttributeWithOwnership, PagedModelIdentityAttributeWithOwnership } from '@simpl/api-client-authenticationprovider-v1';
import en from "../../../assets/i18n/en.json";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";


describe('RoleComponent', () => {
  let component: RoleComponent;
  let fixture: ComponentFixture<RoleComponent>;
  let rolesService: jest.Mocked<RolesService>;
  let router: jest.Mocked<Router>;
  let growl: jest.Mocked<EuiGrowlService>;
  let identityAttrDetailSubject: Subject<IdentityAttribute[]>;
  let roleDetailSubject: Subject<Role | null>;

  const createComponent = (id: string | null = null) => {
    TestBed.configureTestingModule({
      imports: [
        RoleComponent,
        NoopAnimationsModule,
        TranslocoTestingModule.forRoot({
          translocoConfig: translocoConfig({
            availableLangs: ['en'],
            defaultLang: 'en',
            reRenderOnLangChange: true,
          }),
          langs: { en },
        }),
      ],
      providers: [
        { provide: RolesService, useValue: rolesService },
        { provide: Router, useValue: router },
        { provide: EuiGrowlService, useValue: growl },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleComponent);
    component = fixture.componentInstance;

    if (id) {
      (fixture.componentRef as any).setInput?.('id', id);
      if (!fixture.componentRef.setInput) {
        (component as any).id.set(id);
      }
    }

    fixture.detectChanges();
  };

  const makeIdentityAttributeWithOwnership = (
    code: string,
  ): IdentityAttributeWithOwnership =>
    ({
      code,
    } as any);

  const makePagedResponse = (
    content: IdentityAttributeWithOwnership[],
    total: number,
  ): PagedModelIdentityAttributeWithOwnership =>
    ({
      content,
      page: { totalElements: total },
    } as any);

  beforeEach(() => {
    identityAttrDetailSubject = new Subject<IdentityAttribute[]>();
    roleDetailSubject = new Subject<Role | null>();

    rolesService = {
      getIdentityAttributeList: jest.fn(() =>
        of({ items: [makeIdentityAttributeWithOwnership('A')] as any, total: 1 } as any),
      ),
      getIdentityAttributeParticipants: jest.fn(() => of([])),
      getRoleIdentityAttributes: jest.fn(() => of([] as IdentityAttribute[])),
      assignIdentityAttributesToARole: jest.fn(() => of(void 0)),
      createNewRole: jest.fn(() =>
        of({ id: 'new-id', name: 'New', code: 'NEW', description: 'New', enabled: true } as Role),
      ),
      editRole: jest.fn(() =>
        of({ id: '123', name: 'Edit', code: 'EDIT', description: 'Edit', enabled: true } as Role),
      ),
      deleteRole: jest.fn(() => of(void 0)),
      getRoleList: jest.fn(() => of([])),
      getRoleDetail: jest.fn(() => of({ id: '123' } as Role)),
      roleDetail$: roleDetailSubject.asObservable(),
      _identityAttributeRoleDetail$: identityAttrDetailSubject.asObservable(),
    } as any;

    router = {
      navigate: jest.fn(),
    } as any;

    growl = {
      growl: jest.fn(),
    } as any;


    jest.clearAllMocks();
  });

  describe('getIdentityAttributeList', () => {
    it('should load identity attributes with default filters', () => {
      createComponent(null);

      (rolesService.getIdentityAttributeList as jest.Mock).mockClear();
      (rolesService.getIdentityAttributeParticipants as jest.Mock).mockClear();

      component.getIdentityAttributs();

      expect(rolesService.getIdentityAttributeParticipants).toHaveBeenCalledTimes(1);
      expect(rolesService.getIdentityAttributeList).toHaveBeenCalledTimes(1);

      const [filters] = rolesService.getIdentityAttributeList.mock.calls[0];
      expect(filters).toEqual({
        page: component.paginator.page,
        size: component.paginator.pageSize,
        sort: [],
        name: undefined,
        code: undefined,
        assignableToRoles: null,
        enabled: null,
        updateTimestampFrom: undefined,
        updateTimestampTo: undefined,
      });
    });

    it('should apply filters and sorting and reload list', () => {
      createComponent(null);

      (rolesService.getIdentityAttributeList as jest.Mock).mockClear();
      (rolesService.getIdentityAttributeParticipants as jest.Mock).mockClear();

      component.filtersSearch.patchValue({
        name: 'John',
        code: 'CODE',
      });
      component.sortingCriteria = ['name,asc'];

      component.getIdentityAttributs();

      expect(rolesService.getIdentityAttributeParticipants).toHaveBeenCalledTimes(1);
      expect(rolesService.getIdentityAttributeList).toHaveBeenCalledTimes(1);

      const [filters] = rolesService.getIdentityAttributeList.mock.calls[0];
      expect(filters.page).toBe(component.paginator.page);
      expect(filters.size).toBe(component.paginator.pageSize);
      expect(filters.sort).toEqual(['name,asc']);
      expect(filters.name).toBe('John');
      expect(filters.code).toBe('CODE');
    });
  });

  describe('sorting and chips', () => {
    it('should update sortingCriteria and refresh list on sort change', () => {
      createComponent(null);
      const getListSpy = jest.spyOn(component, 'getIdentityAttributs');

      component.onSortChange([
        { sort: 'name', order: 'asc' } as any,
        { sort: 'code', order: 'desc' } as any,
      ]);

      expect(component.sortingCriteria).toEqual(['name,asc', 'code,desc']);
      expect(getListSpy).toHaveBeenCalled();
    });

    it('should build chips for filters and date range', () => {
      createComponent(null);

      const startRange = { format: jest.fn(() => '01/01/2024') } as any;
      const endRange = { format: jest.fn(() => '02/01/2024') } as any;

      component.filtersSearch.patchValue({
        name: 'testName',
        code: '',
        updateTimestamp: { startRange, endRange },
      });

      component.updateChips();

      expect(component.roleChips).toEqual([
        { field: 'name', value: 'testName' },
        { field: 'updateTimestampFrom', value: '01/01/2024' },
        { field: 'updateTimestampTo', value: '02/01/2024' },
      ]);
    });
  });

  describe('selection helpers', () => {
    it('getPreSelected should merge attributes and assignedIdentityAttributes', () => {
      createComponent(null);

      const attrA = { code: 'A' } as IdentityAttribute;
      const attrB = { code: 'B' } as IdentityAttribute;
      const attrC = { code: 'C' } as IdentityAttribute;

      component.data = [
        { code: 'A' } as any,
        { code: 'B' } as any,
        { code: 'C' } as any,
      ];
      component.identityAttributes = [attrA, attrB];
      component.assignedIdentityAttributes = [attrB, attrC];

      const result = component.retrievePreSelected();
      expect(result.map((r) => r.code)).toEqual(['A', 'B', 'B', 'C']);
    });

    it('getCheck should return true when row is in attributes', () => {
      createComponent(null);

      const row = makeIdentityAttributeWithOwnership('A');
      component.identityAttributes = [{ code: 'A' } as IdentityAttribute];

      expect(component.onGetCheck(row)).toBe(true);
      expect(component.onGetCheck(makeIdentityAttributeWithOwnership('B'))).toBe(
        false,
      );
    });

    it('toggleCheckedState should add attribute when checked', () => {
      createComponent(null);

      const row = makeIdentityAttributeWithOwnership('A');
      const event = { target: { checked: true } } as unknown as MouseEvent;

      component.onToggleCheckedState(event, row);

      expect(component.identityAttributes.length).toBe(1);
      expect(component.identityAttributes[0].code).toBe('A');
    });

    it('toggleCheckedState should remove attribute when unchecked', () => {
      createComponent(null);

      const row = makeIdentityAttributeWithOwnership('A');
      component.identityAttributes = [{ code: 'A' } as IdentityAttribute];
      const event = { target: { checked: false } } as unknown as MouseEvent;

      component.onToggleCheckedState(event, row);

      expect(component.identityAttributes.length).toBe(0);
    });
  });

  describe('pagination', () => {
    it('onPageChange should update pagination and reload list', () => {
      createComponent(null);
      const getListSpy = jest.spyOn(component, 'getIdentityAttributs');

      const newPage = { page: 2, pageSize: 10, nbPage: 4 } as any;
      component.pageChange(newPage);

      expect(component.paginator).toEqual(newPage);
      expect(getListSpy).toHaveBeenCalled();
    });
  });

  describe('onRole - new mode', () => {
    it('should create new role, assign attributes and navigate on success', async () => {
      createComponent(null);

      component.role.patchValue({
        name: 'New',
        code: 'NEW',
        description: 'New role',
        enabled: true,
      });

      const identityAttr: IdentityAttribute = { code: 'ID1' } as any;
      component.identityAttributes = [identityAttr];

      component.onRole();

      await Promise.resolve();

      expect(rolesService.createNewRole).toHaveBeenCalled();
      expect(rolesService.assignIdentityAttributesToARole).toHaveBeenCalledWith(
        'new-id',
        component.identityAttributes,
      );
      expect(growl.growl).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Role was successfully created.',
      });
      expect(router.navigate).toHaveBeenCalledWith(['/roles']);
    });

    it('should show error growl when createNewRole fails', async () => {
      rolesService.createNewRole.mockReturnValueOnce(
        throwError(() => new Error('create failed')),
      );

      createComponent(null);

      component.role.patchValue({
        name: 'New',
        code: 'NEW',
        description: 'New role',
        enabled: true,
      });

      component.onRole();

      await Promise.resolve();

      expect(growl.growl).toHaveBeenCalledWith({
        severity: 'danger',
        summary: 'Something went wrong. Please try again.',
      });
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('onRole - edit mode', () => {
    it('should edit role, assign attributes and show success growl', async () => {
      createComponent('123');

      component.role.patchValue({
        name: 'Edit',
        code: 'EDIT',
        description: 'Edit role',
        enabled: true,
      });

      const identityAttr: IdentityAttribute = { code: 'ID1' } as any;
      component.identityAttributes = [identityAttr];

      component.onRole();

      await Promise.resolve();

      expect(rolesService.editRole).toHaveBeenCalledWith(
        '123',
        component.role.getRawValue(),
      );
      expect(rolesService.assignIdentityAttributesToARole).toHaveBeenCalledWith(
        '123',
        component.identityAttributes,
      );
      expect(growl.growl).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Role was successfully modified.',
      });
    });

    it('should show error growl when editRole fails', async () => {

      rolesService.editRole.mockReturnValueOnce(
        throwError(() => new Error('edit failed')),
      );

      createComponent('123');

      component.role.patchValue({
        name: 'Edit',
        code: 'EDIT',
        description: 'Edit role',
        enabled: true,
      });

      component.onRole();

      await Promise.resolve();

      expect(growl.growl).toHaveBeenCalledWith({
        severity: 'danger',
        summary: 'Something went wrong. Please try again.',
      });

      expect(growl.growl).not.toHaveBeenCalledWith({
        severity: 'success',
        summary: 'newEditRole.editRole.saveSuccess',
      });
    });
  });

  describe('onCancel', () => {
    it('should navigate back to roles', () => {
      createComponent(null);

      component.onCancel();

      expect(router.navigate).toHaveBeenCalledWith(['/roles']);
    });
  });

  describe('identity attributes subscription', () => {
    it('should not break when _identityAttributeRoleDetail$ emits', () => {
      createComponent('123');

      const attrs: IdentityAttribute[] = [
        { code: 'ID1' } as any,
        { code: 'ID2' } as any,
      ];

      expect(() => identityAttrDetailSubject.next(attrs)).not.toThrow();
      expect(component.assignedIdentityAttributes).toBeDefined();
      expect(component.identityAttributes).toBeDefined();
    });
  });

  describe('removeChip', () => {
    it('should clear updateTimestampFrom and reload list when removing from chip', () => {
      createComponent(null);
      const getListSpy = jest.spyOn(component, 'getIdentityAttributs');

      const startRange = {
        format: jest.fn(() => '01/01/2024'),
        toISOString: jest.fn(() => '2024-01-01T00:00:00.000Z'),
      } as any;
      const endRange = {
        format: jest.fn(() => '02/01/2024'),
        clone: jest.fn(() => ({
          add: jest.fn(() => ({
            toISOString: jest.fn(() => '2024-01-03T00:00:00.000Z'),
          })),
        })),
      } as any;

      component.filtersSearch.patchValue({
        updateTimestamp: { startRange, endRange },
      });

      const event = {
        chips: [],
        removed: { id: 'updateTimestampFrom' } as any,
      };

      component.onRemoveChip(event as any);

      const dateRange = component.filtersSearch.get('updateTimestamp')!.value;
      expect(dateRange.startRange).toBeNull();
      expect(dateRange.endRange).toBe(endRange);
      expect(getListSpy).toHaveBeenCalled();
    });

    it('should clear updateTimestampTo and reload list when removing to chip', () => {
      createComponent(null);
      const getListSpy = jest.spyOn(component, 'getIdentityAttributs');

      const startRange = {
        format: jest.fn(() => '01/01/2024'),
        toISOString: jest.fn(() => '2024-01-01T00:00:00.000Z'),
      } as any;
      const endRange = {
        format: jest.fn(() => '02/01/2024'),
        clone: jest.fn(() => ({
          add: jest.fn(() => ({
            toISOString: jest.fn(() => '2024-01-03T00:00:00.000Z'),
          })),
        })),
      } as any;

      component.filtersSearch.patchValue({
        updateTimestamp: { startRange, endRange },
      });

      const event = {
        chips: [],
        removed: { id: 'updateTimestampTo' } as any,
      };

      component.onRemoveChip(event as any);

      const dateRange = component.filtersSearch.get('updateTimestamp')!.value;
      expect(dateRange.startRange).toBe(startRange);
      expect(dateRange.endRange).toBeNull();
      expect(getListSpy).toHaveBeenCalled();
    });

    it('should reset simple field filter and reload list when removing normal chip', () => {
      createComponent(null);
      const getListSpy = jest.spyOn(component, 'getIdentityAttributs');

      component.filtersSearch.patchValue({ name: 'testName' });

      const event = {
        chips: [],
        removed: { id: 'name' } as any,
      };

      component.onRemoveChip(event as any);

      expect(component.filtersSearch.get('name')!.value).toBeNull();
      expect(getListSpy).toHaveBeenCalled();
    });
  });

  describe('resetFilters', () => {
    it('should reset all filters and reload list', () => {
      createComponent(null);

      const getListSpy = jest.spyOn(component, 'getIdentityAttributs');

      component.filtersSearch.patchValue({
        name: 'foo',
        code: 'bar',
        updateTimestamp: {
          startRange: { some: 'start' } as any,
          endRange: { some: 'end' } as any,
        },
      });

      expect(component.filtersSearch.get('name')!.value).toBe('foo');
      expect(component.filtersSearch.get('code')!.value).toBe('bar');

      component.onResetFilters();

      expect(component.filtersSearch.get('name')!.value).toBeNull();
      expect(component.filtersSearch.get('code')!.value).toBeNull();
      const dateRange = component.filtersSearch.get('updateTimestamp')!.value;
      expect(dateRange.startRange).toBeNull();
      expect(dateRange.endRange).toBeNull();

      expect(getListSpy).toHaveBeenCalled();
    });
  });

  describe('ngOnInit edit mode', () => {
    it('should switch to edit mode, load role detail and disable name/code', () => {
      createComponent('123');

      expect(component.mode).toBe('edit');
      expect(rolesService.getRoleDetail).toHaveBeenCalledWith('123');
      expect(rolesService.getRoleIdentityAttributes).toHaveBeenCalledWith('123');
    });

    it('should patch role form and disable name/code when roleDetail$ emits', () => {
      createComponent('123');

      const role: Role = {
        id: '123',
        name: 'MyRole',
        code: 'MY_ROLE',
        description: 'My test role',
        enabled: true,
      } as any;

      roleDetailSubject.next(role);

      expect(component.role.get('name')!.value).toBe('MyRole');
      expect(component.role.get('code')!.value).toBe('MY_ROLE');
      expect(component.role.get('description')!.value).toBe('My test role');
      expect(component.role.get('enabled')!.value).toBe(true);

      expect(component.role.get('name')!.disabled).toBe(true);
      expect(component.role.get('code')!.disabled).toBe(true);
    });
  });
});

