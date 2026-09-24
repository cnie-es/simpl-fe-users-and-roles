import {ComponentFixture, TestBed} from '@angular/core/testing';

import { RoleRequestsManagementComponent } from './role-requests-management.component';
import {TranslateModule} from "@ngx-translate/core";
import {of, Subject, throwError} from "rxjs";
import {RoleRequestsService} from "@simpl/api-client-usersroles-tier1-v2";
import {EuiAppShellService} from "@eui/core";
import {EUI_PAGE} from "@eui/components/eui-page";
import {NO_ERRORS_SCHEMA} from "@angular/core";
import {EuiDialogService} from "@eui/components/eui-dialog";
import {RoleRequestsManagementService} from "./role-requests-management.service";

describe('RoleRequestsManagementComponent', () => {
  let component: RoleRequestsManagementComponent;
  let fixture: ComponentFixture<RoleRequestsManagementComponent>;

  let roleRequestsServiceMock;
  let asServiceMock;

  beforeEach(async () => {
    roleRequestsServiceMock = {
      searchRoleRequests: jest.fn().mockReturnValue(of({items: []})),
      getRoleRequestById: jest.fn(),
    }
    asServiceMock = {
      isBlockDocumentActive: true
    }
    await TestBed.configureTestingModule({
      imports: [RoleRequestsManagementComponent, TranslateModule.forRoot()],
      providers: [
        {provide: RoleRequestsService, useValue: roleRequestsServiceMock},
        {provide: EuiAppShellService, useValue: asServiceMock},
        RoleRequestsManagementService,
        EuiDialogService
      ]
    }).overrideComponent(RoleRequestsManagementComponent, {
      remove: {
        imports: [
          ...EUI_PAGE
        ]
      },
      add: {
        schemas: [
          NO_ERRORS_SCHEMA
        ],
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleRequestsManagementComponent);
    component = fixture.componentInstance;
    (component as any).roleRequestDetailDialog = jest.fn().mockReturnValue({
      openDialog: jest.fn(),
      closeDialog: jest.fn(),
    });
    fixture.detectChanges();
  });

  describe('getRoleRequestsList method', () => {
    it('builds the sort array and forwards pagination and filters to the service', () => {
      component.roleRequestsManagementService.dataSorting.set([
        {sort: 'createdAt', order: 'asc'} as any,
        {sort: 'updatedAt', order: 'desc'} as any,
      ]);
      component.roleRequestsManagementService.pagination.set({page: 2, pageSize: 50} as any);
      component.roleRequestsManagementService.roleRequestsFilterForm.patchValue({
        createdBy: 'alice',
        status: 'PENDING' as any,
      });

      component.getRoleRequestsList().subscribe();

      expect(roleRequestsServiceMock.searchRoleRequests).toHaveBeenCalledWith(
        2,
        50,
        ['createdAt', '-updatedAt'],
        'alice',
        'PENDING'
      );
    });

    it('stores the response in roleRequestsData', () => {
      const response = {items: [{id: '1'}]} as any;
      roleRequestsServiceMock.searchRoleRequests.mockReturnValueOnce(of(response));

      component.getRoleRequestsList().subscribe();

      expect(component.roleRequestsManagementService.roleRequestsData()).toBe(response);
    });

    it('uses undefined when filters are unset', () => {
      component.roleRequestsManagementService.roleRequestsFilterForm.setValue({createdBy: null, status: null});

      component.getRoleRequestsList().subscribe();

      expect(roleRequestsServiceMock.searchRoleRequests).toHaveBeenCalledWith(
        0,
        5,
        [],
        undefined,
        undefined
      );
    });
  });

  describe('RoleRequestsManagementComponent - additional coverage', () => {
    it('sets an empty sort array when no sorting is provided', () => {
      component.roleRequestsManagementService.dataSorting.set([]);
      component.roleRequestsManagementService.pagination.set({ page: 1, pageSize: 25 } as any);
      component.roleRequestsManagementService.roleRequestsFilterForm.patchValue({ createdBy: 'bob', status: 'APPROVED' as any });

      component.getRoleRequestsList().subscribe();

      expect(roleRequestsServiceMock.searchRoleRequests).toHaveBeenCalledWith(
        1,
        25,
        [],
        'bob',
        'APPROVED'
      );
    });

    it('maps sorting orders correctly when multiple criteria are provided', () => {
      component.roleRequestsManagementService.dataSorting.set([
        { sort: 'name', order: 'asc' } as any,
        { sort: 'createdAt', order: 'desc' } as any
      ]);
      component.roleRequestsManagementService.pagination.set({ page: 3, pageSize: 15 } as any);
      component.roleRequestsManagementService.roleRequestsFilterForm.patchValue({ createdBy: null, status: null });

      component.getRoleRequestsList().subscribe();

      expect(roleRequestsServiceMock.searchRoleRequests).toHaveBeenCalledWith(
        3,
        15,
        ['name', '-createdAt'],
        undefined,
        undefined
      );
    });

    it('stores null in roleRequestsData when the service returns null', () => {
      roleRequestsServiceMock.searchRoleRequests.mockReturnValueOnce(of(null));

      component.getRoleRequestsList().subscribe();

      expect(component.roleRequestsManagementService.roleRequestsData()).toBeNull();
    });
  });

  describe('resetFilters method', () => {
    it('resets form, clears chips, resets page and calls service with undefined filters', () => {
      component.roleRequestsManagementService.roleRequestsFilterForm.patchValue({ createdBy: 'john', status: 'APPROVED' as any });
      component.roleRequestsManagementService.filtersChips.set([{ id: 'createdBy', label: 'createdBy:john', typeClass: 'primary', isDeletable: true } as any]);
      component.roleRequestsManagementService.pagination.set({ page: 4, pageSize: 10, nbPage: 5 } as any);
      component.roleRequestsManagementService.dataSorting.set([]);

      component.resetFilters();

      expect(component.roleRequestsManagementService.roleRequestsFilterForm.value).toEqual({ createdBy: null, status: null });
      expect(component.roleRequestsManagementService.filtersChips().length).toBe(0);
      expect(component.roleRequestsManagementService.pagination().page).toBe(0);
      expect(roleRequestsServiceMock.searchRoleRequests).toHaveBeenCalledWith(
        0,
        10,
        [],
        undefined,
        undefined
      );
    });
  });

  describe('removeChip method', () => {
    it('removes chip and resets control when called with EuiChip', () => {
      component.roleRequestsManagementService.roleRequestsFilterForm.patchValue({ createdBy: 'john', status: null });
      component.roleRequestsManagementService.filtersChips.set([{ id: 'createdBy', label: 'createdBy:john', typeClass: 'primary', isDeletable: true } as any]);

      component.removeChip({ id: 'createdBy' } as any);

      expect(component.roleRequestsManagementService.roleRequestsFilterForm.get('createdBy').value).toBeNull();
      expect(component.roleRequestsManagementService.filtersChips().find(c => c.id === 'createdBy')).toBeUndefined();
    });

    it('removes chip and resets control when called with EuiChipComponent', () => {
      component.roleRequestsManagementService.roleRequestsFilterForm.patchValue({ createdBy: null, status: 'APPROVED' as any });
      component.roleRequestsManagementService.filtersChips.set([{ id: 'status', label: 'status:APPROVED', typeClass: 'primary', isDeletable: true } as any]);

      component.removeChip({ id: 'status' } as any);

      expect(component.roleRequestsManagementService.roleRequestsFilterForm.get('status').value).toBeNull();
      expect(component.roleRequestsManagementService.filtersChips().find(c => c.id === 'status')).toBeUndefined();
    });
  });

  describe('onSortChange method', () => {
    it('updates sorting array and calls getRoleRequestsList', () => {
      component.onSortChange([{sort: 'name', order: 'asc'} as any]);
      expect(component.roleRequestsManagementService.dataSorting()).toEqual([{sort: 'name', order: 'asc'} as any]);
      expect(roleRequestsServiceMock.searchRoleRequests).toHaveBeenCalled();
    });
  })

  describe('onPageChange method', () => {
    it('updates pagination and calls getRoleRequestsList', () => {
      component.onPageChange({ page: 2, pageSize: 50, nbPage: 50});
      expect(component.roleRequestsManagementService.pagination()).toEqual({ page: 2, pageSize: 50, nbPage: 50 } as any);
      expect(roleRequestsServiceMock.searchRoleRequests).toHaveBeenCalled();
    });
  })

  describe('addFilter method', () => {
    it('removes chip if filter value is falsy', () => {
      component.roleRequestsManagementService.roleRequestsFilterForm.patchValue({ createdBy: null, status: null });
      const removeChipSpy = jest.spyOn(component, 'removeChip');
      const addChipSpy = jest.spyOn(component, 'addChip');
      const resetPaginationSpy = jest.spyOn(component, 'resetPagination');
      const getRoleRequestsListSpy = jest.spyOn(component, 'getRoleRequestsList').mockReturnValue(of({}));

      component.addFilter();

      expect(removeChipSpy).toHaveBeenCalledWith({ id: 'createdBy' });
      expect(removeChipSpy).toHaveBeenCalledWith({ id: 'status' });
      expect(addChipSpy).not.toHaveBeenCalled();
      expect(resetPaginationSpy).toHaveBeenCalled();
      expect(getRoleRequestsListSpy).toHaveBeenCalled();
    });

    it('adds chip if filter value is a non-empty string', () => {
      component.roleRequestsManagementService.roleRequestsFilterForm.patchValue({ createdBy: 'bob', status: null });
      const removeChipSpy = jest.spyOn(component, 'removeChip');
      const addChipSpy = jest.spyOn(component, 'addChip');
      const resetPaginationSpy = jest.spyOn(component, 'resetPagination');
      const getRoleRequestsListSpy = jest.spyOn(component, 'getRoleRequestsList').mockReturnValue(of({}));
      jest.spyOn(component.translateService, 'instant').mockReturnValue('Created By');

      component.addFilter();

      expect(addChipSpy).toHaveBeenCalledWith('createdBy', 'Created By:bob');
      expect(removeChipSpy).toHaveBeenCalledWith({ id: 'status' });
      expect(resetPaginationSpy).toHaveBeenCalled();
      expect(getRoleRequestsListSpy).toHaveBeenCalled();
    });

    it('removes chip if filter value is not a string and is truthy', () => {
      const dateValue = { from: new Date(), to: new Date() };
      component.roleRequestsManagementService.roleRequestsFilterForm.patchValue({ createdBy: dateValue as any, status: null });
      const removeChipSpy = jest.spyOn(component, 'removeChip');
      const addChipSpy = jest.spyOn(component, 'addChip');
      const resetPaginationSpy = jest.spyOn(component, 'resetPagination');
      const getRoleRequestsListSpy = jest.spyOn(component, 'getRoleRequestsList').mockReturnValue(of({}));

      component.addFilter();

      expect(removeChipSpy).toHaveBeenCalledWith({ id: 'createdBy' });
      expect(removeChipSpy).toHaveBeenCalledWith({ id: 'status' });
      expect(addChipSpy).not.toHaveBeenCalled();
      expect(resetPaginationSpy).toHaveBeenCalled();
      expect(getRoleRequestsListSpy).toHaveBeenCalled();
    });
  });

  describe('showRoleRequestDetail method', () => {
    it('requests the role request by id and opens the dialog with the response', () => {
      const row = { id: 'req-1' } as any;
      const roleRequest = { id: 'req-1', createdBy: 'alice' } as any;
      const response$ = new Subject<any>();
      const dialogMock = (component as any).roleRequestDetailDialog();
      roleRequestsServiceMock.getRoleRequestById.mockReturnValueOnce(response$);

      component.showRoleRequestDetail(row);

      expect(roleRequestsServiceMock.getRoleRequestById).toHaveBeenCalledWith('req-1');

      response$.next(roleRequest);
      response$.complete();

      expect(component.roleRequestDetail()).toBe(roleRequest);
      expect(dialogMock.openDialog).toHaveBeenCalled();

    });

    it('unblocks the app shell when the request errors', () => {
      asServiceMock.isBlockDocumentActive = false;
      roleRequestsServiceMock.getRoleRequestById.mockReturnValueOnce(throwError(() => new Error('fail')));

      component.showRoleRequestDetail({ id: 'req-2' } as any);

      expect(asServiceMock.isBlockDocumentActive).toBe(false);
    });
  });

  describe('reviewRoleRequest method', () => {
    it('closes the role request detail dialog', () => {
      const dialogMock = (component as any).roleRequestDetailDialog();

      component.reviewRoleRequest({ id: 'req-3' } as any);

      expect(dialogMock.closeDialog).toHaveBeenCalled();
    });
  });

  describe('onRoleRequestDetailDialogClose method', () => {
    it('clears the roleRequestDetail signal', () => {
      component.roleRequestDetail.set({ id: 'req-4' } as any);

      component.onRoleRequestDetailDialogClose();

      expect(component.roleRequestDetail()).toBeNull();
    });
  });

});
