import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleDetailComponent } from './role-detail.component';
import { RolesService } from '../roles.service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, finalize, of, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import {
  IdentityAttributeWithOwnership,
} from '@simpl/api-client-authenticationprovider-v1';
import { IdentityAttribute, Role } from '@simpl/api-client-usersroles-tier1-v2';
import { EuiChip } from '@eui/components/eui-chip';
import { FormControl } from '@angular/forms';
import { Sort } from '@eui/components/eui-table-v2';
import { EuiPaginationEvent } from '@eui/components/eui-paginator';
import { fakeAsync, flush } from '@angular/core/testing';
import moment from 'moment-timezone';
import en from '../../../assets/i18n/en.json';

const matDialogMock = {
  open: jest.fn().mockReturnValue({
    afterClosed: jest.fn().mockReturnValue(of(true)),
  }),
};

describe('RoleDetailComponent', () => {
  let component: RoleDetailComponent;
  let fixture: ComponentFixture<RoleDetailComponent>;
  let rolesServiceMock: any;

  const mockRoleDetail: Role = {
    id: '123',
    code: 'TEST_ROLE',
    name: 'Test Role',
    description: 'Test Description',
    enabled: true,
  };

  const mockIdentityAttributes: IdentityAttribute[] = [
    { code: 'attr1' } as IdentityAttribute,
    { code: 'attr2' } as IdentityAttribute,
    { code: 'attr3' } as IdentityAttribute,
  ];

  let mockRoleDetailSubject: BehaviorSubject<Role | null>;

  beforeEach(async () => {
    mockRoleDetailSubject = new BehaviorSubject<Role | null>(mockRoleDetail);
    rolesServiceMock = {
      getRoleDetail: jest.fn().mockReturnValue(of(mockRoleDetail)),
      getRoleIdentityAttributes: jest
        .fn()
        .mockReturnValue(of(mockIdentityAttributes)),
      roleDetail$: mockRoleDetailSubject.asObservable(),
      _identityAttributeRoleDetail$: of(mockIdentityAttributes),
      assignIdentityAttributesToARole: jest.fn(),
      getIdentityAttributeList: jest.fn().mockReturnValue(of(null)),
      // RoleDetailComponent expects an array from this call (see getIdentityAttributeList())
      getIdentityAttributeParticipants: jest.fn().mockReturnValue(of([])),
    };
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatButton,
        RoleDetailComponent,
        TranslocoTestingModule.forRoot({
          translocoConfig: {
            availableLangs: ['en'],
            defaultLang: 'en',
          },
          langs: { en: en },
        }),
      ],
      providers: [
        {
          provide: RolesService,
          useValue: rolesServiceMock,
        },
        { provide: MatDialog, useValue: matDialogMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { id: '123' } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleDetailComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('getIdentityAttributeList', () => {
    it('should set tableLoading to true before fetching data', () => {
      const tableLoadingSpy = jest.spyOn(component.tableLoading, 'set');
      rolesServiceMock.getIdentityAttributeParticipants.mockReturnValue(of([]));
      rolesServiceMock.getIdentityAttributeList.mockReturnValue(of({ items: [], total: 0 }));
      component.getIdentityAttributeList();
      expect(tableLoadingSpy).toHaveBeenCalledWith(true);
    });

    it('should update data and totalElements on successful API call and mark assignedToParticipant', fakeAsync(() => {
      const participantsResponse = [{ id: '2', code: 'attr2' } as any];
      const listResponse = {
        items: [
          { id: '1', code: 'attr1' } as any,
          { id: '2', code: 'attr2' } as any,
        ],
        total: 2,
      } as any;

      jest
        .spyOn(rolesServiceMock, 'getIdentityAttributeParticipants')
        .mockReturnValue(of(participantsResponse));
      jest
        .spyOn(rolesServiceMock, 'getIdentityAttributeList')
        .mockReturnValue(of(listResponse));

      // Normally set in ngOnInit(); without it, forkJoin calls the service with undefined paging.
      component.pagination = { page: 0, pageSize: 5, nbPage: 5 } as any;

      component.getIdentityAttributeList();
      flush();

      expect(component.data.length).toBe(2);
      expect(component.totalElements).toBe(2);
      expect((component.data[0] as any).assignedToParticipant).toBe(false);
      expect((component.data[1] as any).assignedToParticipant).toBe(true);
    }));

    it('should reset tableLoading to false after API call', () => {
      const finalizeCallback = jest.fn();
      jest
        .spyOn(rolesServiceMock, 'getIdentityAttributeParticipants')
        .mockReturnValue(of([]));
      jest
        .spyOn(rolesServiceMock, 'getIdentityAttributeList')
        .mockReturnValue(of({ items: [] }).pipe(finalize(finalizeCallback)));

      component.getIdentityAttributeList();

      expect(finalizeCallback).toHaveBeenCalled();
    });
  });

  describe('removeChip', () => {
    it('should reset startRange in the filtersForm when the chip id is updateTimestampFrom', () => {
      rolesServiceMock.getIdentityAttributeList.mockReturnValue(of(null));
      const fakeDate = moment(new Date());
      component.filtersForm.get('updateTimestamp')!.setValue({
        startRange: fakeDate,
        endRange: fakeDate,
      });
      component.removeChip({
        chips: [],
        removed: { id: 'updateTimestampFrom', label: '' } as EuiChip,
      });
      expect(component.filtersForm.value.updateTimestamp).toEqual({
        startRange: null,
        endRange: fakeDate,
      });
    });

    it('should reset endRange in the filtersForm when the chip id is updateTimestampTo', () => {
      rolesServiceMock.getIdentityAttributeList.mockReturnValue(of(null));
      const fakeDate = moment(new Date());
      component.filtersForm.get('updateTimestamp')!.setValue({
        startRange: fakeDate,
        endRange: fakeDate,
      });
      component.removeChip({
        chips: [],
        removed: { id: 'updateTimestampTo', label: '' } as EuiChip,
      });
      expect(component.filtersForm.value.updateTimestamp).toEqual({
        startRange: fakeDate,
        endRange: null,
      });
    });

    it('should reset the correct field in the filtersForm when a chip with a different id is removed', () => {
      rolesServiceMock.getIdentityAttributeList.mockReturnValue(of(null));
      component.filtersForm.addControl('name', new FormControl('test name'));
      const resetSpy = jest.spyOn(component.filtersForm.get('name')!, 'reset');
      component.removeChip({
        chips: [],
        removed: { id: 'name', label: '' } as EuiChip,
      });
      expect(resetSpy).toHaveBeenCalled();
    });

    it('should call getIdentityAttributeList after removing a chip', () => {
      rolesServiceMock.getIdentityAttributeList.mockReturnValue(of(null));
      const getIdentityAttributeListSpy = jest.spyOn(
        component,
        'getIdentityAttributeList'
      );
      component.removeChip({
        chips: [],
        removed: { id: 'name', label: '' } as EuiChip,
      });
      expect(getIdentityAttributeListSpy).toHaveBeenCalled();
    });
  });

  it('should load role details on init', () => {
    component.ngOnInit();
    expect(rolesServiceMock.getRoleDetail).toHaveBeenCalledWith('123');
    expect(component.roleDetail).toEqual(mockRoleDetail);
  });

  it('should update role details when roleDetail$ emits', () => {
    component.ngOnInit();
    const newRole: Role = {
      id: '123',
      code: 'NEW_CODE',
      name: 'New Name',
      enabled: true,
    };
    mockRoleDetailSubject.next(newRole);
    expect(component.roleDetail).toEqual(newRole);
  });

  describe('onSortChange', () => {
    it('should update sortingCriteria based on the provided input', () => {
      const mockSortCriteria = [
        { sort: 'name', order: 'asc' },
        { sort: 'code', order: 'desc' },
      ] as Sort[];
      component.onSortChange(mockSortCriteria);
      expect(component.sortingCriteria).toEqual(['name,asc', 'code,desc']);
    });

    it('should call getIdentityAttributeList after updating sortingCriteria', () => {
      const getIdentityAttributeListSpy = jest.spyOn(
        component,
        'getIdentityAttributeList'
      );
      const mockSortCriteria = [{ sort: 'name', order: 'asc' }] as Sort[];
      component.onSortChange(mockSortCriteria);
      expect(getIdentityAttributeListSpy).toHaveBeenCalled();
    });
  });

  describe('onPageChange', () => {
    it('should update the pagination property when called', () => {
      const newPagination = {
        page: 2,
        pageSize: 10,
        nbPage: 5,
      } as EuiPaginationEvent;
      component.onPageChange(newPagination);
      expect(component.pagination).toEqual(newPagination);
    });

    it('should call getIdentityAttributeList after pagination change', () => {
      const getIdentityAttributeListSpy = jest.spyOn(
        component,
        'getIdentityAttributeList'
      );
      const newPagination = {
        page: 1,
        pageSize: 5,
        nbPage: 5,
      } as EuiPaginationEvent;
      component.onPageChange(newPagination);
      expect(getIdentityAttributeListSpy).toHaveBeenCalled();
    });
  });

  describe('getPreSelected', () => {
    it('should return pre-selected attributes matching assigned and current attributes', () => {
      component.attributes = [mockIdentityAttributes[0]];
      component.assignedIdentityAttributes = [mockIdentityAttributes[2]];
      component.data = [
        { code: 'attr1' } as any,
        { code: 'attr2' } as any,
        { code: 'attr3' } as any,
      ];

      const result = component.getPreSelected();

      expect(result.map((r) => r.code)).toEqual(['attr1', 'attr3']);
    });

    it('should return an empty array if no attributes match', () => {
      component.attributes = [];
      component.assignedIdentityAttributes = [];
      component.data = [
        { code: 'attr1' } as any,
        { code: 'attr2' } as any,
      ];

      const result = component.getPreSelected();

      expect(result).toEqual([]);
    });

    it('should handle undefined or null assignedIdentityAttributes gracefully', () => {
      component.attributes = [];
      component.assignedIdentityAttributes = undefined as any;
      component.data = [
        { code: 'attr1' } as any,
        { code: 'attr2' } as any,
      ];

      const result = component.getPreSelected();

      expect(result).toEqual([]);
    });
  });

  describe('onResetAttributes', () => {
    it('should reset attributes to the assignedIdentityAttributes', () => {
      component.assignedIdentityAttributes = [
        mockIdentityAttributes[0],
        mockIdentityAttributes[1],
      ];
      component.attributes = [mockIdentityAttributes[2]];

      component.onResetAttributes();

      expect(component.attributes).toEqual([
        mockIdentityAttributes[0],
        mockIdentityAttributes[1],
      ]);
    });

    it('should set attributes to an empty array if assignedIdentityAttributes is empty', () => {
      component.assignedIdentityAttributes = [];
      component.attributes = [mockIdentityAttributes[2]];

      component.onResetAttributes();

      expect(component.attributes).toEqual([]);
    });
  });

  describe('getCheck', () => {
    it('should return true if the row code is in the attributes array', () => {
      component.attributes = [mockIdentityAttributes[0], mockIdentityAttributes[1]];
      const row = {
        code: 'attr1',
        name: 'Attribute 1',
      } as IdentityAttributeWithOwnership;

      const result = component.getCheck(row);

      expect(result).toBe(true);
    });

    it('should return false if the row code is not in the attributes array', () => {
      component.attributes = [mockIdentityAttributes[0], mockIdentityAttributes[1]];
      const row = {
        code: 'attr3',
        name: 'Attribute 3',
      } as IdentityAttributeWithOwnership;

      const result = component.getCheck(row);

      expect(result).toBe(false);
    });

    it('should return false if the attributes array is empty', () => {
      component.attributes = [];
      const row = {
        code: 'attr1',
        name: 'Attribute 1',
      } as IdentityAttributeWithOwnership;

      const result = component.getCheck(row);

      expect(result).toBe(false);
    });
  });

  describe('toggleCheckedState', () => {
    it('should add the attribute to the attributes array when the checkbox is checked', () => {
      component.attributes = [];
      const row = {
        code: 'attr1',
        name: 'Attribute 1',
      } as IdentityAttributeWithOwnership;

      const mockTarget = {
        checked: true,
        type: 'checkbox',
      } as HTMLInputElement;

      const mockEvent = {
        target: mockTarget,
        type: 'click',
        bubbles: true,
      } as unknown as MouseEvent;

      component.toggleCheckedState(mockEvent, row);

      expect(component.attributes.find((a) => a.code === 'attr1')).toBeDefined();
    });

    it('should remove the attribute from the attributes array when the checkbox is unchecked', () => {
      component.attributes = [mockIdentityAttributes[0]];
      const row = {
        code: 'attr1',
        name: 'Attribute 1',
      } as IdentityAttributeWithOwnership;

      const mockTarget = {
        checked: false,
        type: 'checkbox',
      } as HTMLInputElement;

      const mockEvent = {
        target: mockTarget,
        type: 'click',
        bubbles: true,
      } as unknown as MouseEvent;

      component.toggleCheckedState(mockEvent, row);

      expect(component.attributes.find((a) => a.code === 'attr1')).toBeUndefined();
    });
  });

  describe('resetFilters', () => {
    it('should reset the filtersForm fields to their initial values', () => {
      component.filtersForm.patchValue({
        name: 'Test Name',
        code: 'Test Code',
        updateTimestamp: {
          startRange: new Date(),
          endRange: new Date(),
        },
      });

      component.resetFilters();

      expect(component.filtersForm.value).toEqual({
        name: null,
        code: null,
        updateTimestamp: {
          startRange: null,
          endRange: null,
        },
      });
    });

    it('should call updateValueAndValidity on filtersForm', () => {
      const updateValiditySpy = jest.spyOn(
        component.filtersForm,
        'updateValueAndValidity'
      );

      component.resetFilters();

      expect(updateValiditySpy).toHaveBeenCalled();
    });

    it('should call getIdentityAttributeList', () => {
      const getIdentityAttributeListSpy = jest.spyOn(
        component,
        'getIdentityAttributeList'
      );

      component.resetFilters();

      expect(getIdentityAttributeListSpy).toHaveBeenCalled();
    });
  });

  describe('confirmSave', () => {
    it('should call assignIdentityAttributesToARole with correct parameters', () => {
      const roleId = '123';
      const attributes: IdentityAttribute[] = [
        { code: 'attr1' },
        { code: 'attr2' },
      ];
      component.roleId = roleId;
      component.attributes = attributes;

      jest
        .spyOn(rolesServiceMock, 'assignIdentityAttributesToARole')
        .mockReturnValue(of(null));
      jest.spyOn(component, 'getIdentityAttributeList');

      component.confirmSave();

      expect(rolesServiceMock.assignIdentityAttributesToARole).toHaveBeenCalledWith(
        roleId,
        attributes
      );
    });

    it('should set loading to true at the beginning and false at the end', () => {
      const loadingSpy = jest.spyOn(component.loading, 'set');
      jest
        .spyOn(rolesServiceMock, 'assignIdentityAttributesToARole')
        .mockReturnValue(of(null));

      component.confirmSave();

      expect(loadingSpy).toHaveBeenCalledWith(true);
      expect(loadingSpy).toHaveBeenCalledWith(false);
    });

    it('should handle successful save and update saveStatus to success', () => {
      jest
        .spyOn(rolesServiceMock, 'assignIdentityAttributesToARole')
        .mockReturnValue(of(null));
      jest
        .spyOn(rolesServiceMock, 'getRoleDetail')
        .mockReturnValue(of(mockRoleDetail));
      jest.spyOn(component, 'getIdentityAttributeList');

      component.confirmSave();

      expect(component.saveStatus).toBe('success');
      expect(rolesServiceMock.getRoleDetail).toHaveBeenCalledWith('123');
      expect(component.getIdentityAttributeList).toHaveBeenCalled();
    });

    it('should handle error and update saveStatus to error', () => {
      jest
        .spyOn(rolesServiceMock, 'assignIdentityAttributesToARole')
        .mockReturnValue(throwError(() => new Error('Save error')));

      component.confirmSave();

      expect(component.saveStatus).toBe('error');
    });
  });
});

