import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RolesInformationPageComponent } from './roles-information-page.component';
import { RolesService } from '../roles.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Sort } from '@eui/components/eui-table-v2';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { EuiChip } from '@eui/components/eui-chip';
import en from "../../../assets/i18n/en.json"
import { Role } from '@simpl/api-client-usersroles-tier1-v2';
import { EuiDialogService } from '@eui/components/eui-dialog';
import { EuiGrowlService } from '@eui/core';

describe('RolesInformationPageComponent', () => {
  let component: RolesInformationPageComponent;
  let fixture: ComponentFixture<RolesInformationPageComponent>;
  let mockRolesService: jest.Mocked<RolesService>;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: Partial<ActivatedRoute>;
  let mockEuiDialogService: { openDialog: jest.Mock };
  let mockEuiGrowlService: { growl: jest.Mock };

  const mockRolesResponse: { items: Role[]; total: number } = {
    items: [
      { id: '1', code: 'ADMIN', name: 'Admin', description: 'Administrator', enabled: true },
      { id: '2', code: 'USER', name: 'User', description: 'Basic User', enabled: true },
    ],
    total: 2
  };

  beforeEach(async () => {
    mockRolesService = {
      getRoleList: jest.fn().mockReturnValue(of(mockRolesResponse)),
      createNewRole: jest.fn(),
      editRole: jest.fn(),
    } as unknown as jest.Mocked<RolesService>;

    mockRouter = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    mockActivatedRoute = {};

    mockEuiDialogService = {
      openDialog: jest.fn(),
    };

    mockEuiGrowlService = {
      growl: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        RolesInformationPageComponent,
        NoopAnimationsModule,
        TranslocoTestingModule.forRoot(
          {
            translocoConfig: {
              availableLangs: ["en"],
              defaultLang: "en",
            },
            langs: { en: en }
          }
        ),
      ],
      providers: [
        { provide: RolesService, useValue: mockRolesService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: EuiDialogService, useValue: mockEuiDialogService },
        { provide: EuiGrowlService, useValue: mockEuiGrowlService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RolesInformationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values and load roles on init', () => {
    expect(component.pagination).toEqual({
      page: 0,
      pageSize: 5,
      nbPage: 5,
    });
    expect(component.data).toEqual(mockRolesResponse.items);
    expect(component.totalElements).toBe(mockRolesResponse.total);
    expect(mockRolesService.getRoleList).toHaveBeenCalled();
  });

  it('should update pagination and reload roles on page change', () => {
    const newPagination = {
      page: 1,
      pageSize: 5,
      nbPage: 5,
    };

    component.onPageChange(newPagination);

    expect(component.pagination).toEqual(newPagination);
    expect(mockRolesService.getRoleList).toHaveBeenCalled();
  });

  it('should update sorting criteria and reload roles on sort change', () => {
    const sortCriteria: Sort[] = [{ sort: 'name', order: 'asc' }];

    component.onSortChange(sortCriteria);

    expect(component.sortingCriteria).toEqual(['name']);
    expect(mockRolesService.getRoleList).toHaveBeenCalled();
  });

  it('should update sorting criteria with desc and reload roles on sort change', () => {
    const sortCriteria: Sort[] = [{ sort: 'name', order: 'desc' }];

    component.onSortChange(sortCriteria);

    expect(component.sortingCriteria).toEqual(['-name']);
    expect(mockRolesService.getRoleList).toHaveBeenCalled();
  });

  it('should reset filters and reload roles', () => {
    jest.spyOn(component.filtersForm, 'reset');
    jest.spyOn(component.filtersForm, 'updateValueAndValidity');

    component.resetFilters();

    expect(component.filtersForm.reset).toHaveBeenCalled();
    expect(component.filtersForm.updateValueAndValidity).toHaveBeenCalled();
    expect(mockRolesService.getRoleList).toHaveBeenCalled();
  });

  it('should handle error when loading roles', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockRolesService.getRoleList.mockReturnValueOnce(
      throwError(() => new Error('Test error'))
    );

    component.getRoleList();

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should update chips based on form values', () => {
    component.filtersForm.patchValue({
      name: 'Admin',
      code: 'Test',
    });

    component.updateChips();

    expect(component.chips).toEqual([
      { field: 'name', value: 'Admin' },
      { field: 'code', value: 'Test' },
    ]);
  });

  it('should remove chip and reload roles', () => {
    const event = { id: 'name' } as EuiChip;
    const formControlSpy = jest.spyOn(component.filtersForm, 'get');
    const nameControl = component.filtersForm.get('name')!;
    const resetSpy = jest.spyOn(nameControl, 'reset');

    component.removeChip(event);

    expect(formControlSpy).toHaveBeenCalledWith('name');
    expect(resetSpy).toHaveBeenCalled();
    expect(mockRolesService.getRoleList).toHaveBeenCalled();
  });

  it('should set correct HTTP params when getting role list', () => {
    component.getRoleList();

    expect(mockRolesService.getRoleList).toHaveBeenCalledTimes(2);
    const calls = (mockRolesService.getRoleList as jest.Mock).mock.calls;
    expect(calls[0]).toEqual([0, 5, [], null, null]);
    expect(calls[1]).toEqual([0, 5, [], null, null]);
  });

  it('should include filter values in HTTP params when filters are set', () => {
    component.filtersForm.patchValue({
      name: 'Admin',
      code: 'Test',
    });
    component.filtersForm.updateValueAndValidity();
    fixture.detectChanges();

    component.getRoleList();

    expect(mockRolesService.getRoleList).toHaveBeenCalledTimes(2);
    const calls = (mockRolesService.getRoleList as jest.Mock).mock.calls;
    expect(calls[0]).toEqual([0, 5, [], null, null]);
    expect(calls[1]).toEqual([0, 5, [], 'Admin', 'Test']);
  });


  it('should open dialog and, on accept, delete role then show success growl and refresh list', () => {
    const role: Role = { id: '50', code: 'DEL', name: 'To Delete', description: 'desc', enabled: false };

    const getRoleListSpy = jest.spyOn(component, 'getRoleList');
    (mockRolesService.deleteRole as any) = jest.fn().mockReturnValue(of(role));

    component.onDelete(role);

    expect(mockEuiDialogService.openDialog).toHaveBeenCalledTimes(1);
    const configArg = mockEuiDialogService.openDialog.mock.calls[0][0];
    expect(configArg).toBeTruthy();
    expect(typeof configArg.accept).toBe('function');

    configArg.accept();

    expect(mockRolesService.deleteRole).toHaveBeenCalledWith(role.id);

    const growlArg = mockEuiGrowlService.growl.mock.calls.pop()[0];
    expect(growlArg.severity).toBe('success');

    expect(getRoleListSpy).toHaveBeenCalled();
  });

  it('should show danger growl when delete role fails', () => {
    const role: Role = { id: '51', code: 'ERR', name: 'Error Role', description: 'desc', enabled: true };

    (mockRolesService.deleteRole as any) = jest.fn().mockReturnValue(throwError(() => new Error('boom')));

    component.onDelete(role);

    expect(mockEuiDialogService.openDialog).toHaveBeenCalledTimes(1);
    const configArg = mockEuiDialogService.openDialog.mock.calls[0][0];
    expect(configArg).toBeTruthy();

    configArg.accept();

    expect(mockRolesService.deleteRole).toHaveBeenCalledWith(role.id);
    const growlArg = mockEuiGrowlService.growl.mock.calls.pop()[0];
    expect(growlArg.severity).toBe('danger');
  });
});
