import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { RolesService } from './roles.service';
import { IdentityAttribute, Role, RolesService as RoleServiceOpenApi } from '@simpl/api-client-usersroles-tier1-v2';
import { IdentityAttributesService, ParticipantsService } from '@simpl/api-client-authenticationprovider-tier1-v2';

describe('RolesService', () => {
  let service: RolesService;
  let mockRolesServiceOpenApi: jest.Mocked<RoleServiceOpenApi>;
  let mockIdentityAttributesService: jest.Mocked<IdentityAttributesService>;

  beforeEach(() => {
    mockRolesServiceOpenApi = {
      searchRoles: jest.fn(),
      getRoleById: jest.fn(),
      getRoleIdentityAttributes: jest.fn(),
      updateRoleIdentityAttributes: jest.fn(),
      createNewRole: jest.fn(),
      updateRoleById: jest.fn(),
      deleteRoleById: jest.fn(),
    } as unknown as any;

    mockIdentityAttributesService = {
      getDataspaceIdentityAttributes: jest.fn(),
    } as unknown as any;

    const mockParticipantsService: jest.Mocked<ParticipantsService> = {
      getAgentParticipantIdentityAttributes: jest.fn().mockReturnValue(of([]) as any),
    } as unknown as any;

    TestBed.configureTestingModule({
      providers: [
        RolesService,
        { provide: RoleServiceOpenApi, useValue: mockRolesServiceOpenApi },
        { provide: IdentityAttributesService, useValue: mockIdentityAttributesService },
        { provide: ParticipantsService, useValue: mockParticipantsService },
      ],
    });

    service = TestBed.inject(RolesService);
  });

  it('should expose _identityAttributeRoleDetail$ and emit initial null then updated value', (done) => {
    const roleId = 'role-1';
    const attrs: IdentityAttribute[] = [
      { code: 'attr-1', name: 'Attr 1' } as IdentityAttribute,
      { code: 'attr-2', name: 'Attr 2' } as IdentityAttribute,
    ];
    mockRolesServiceOpenApi.getRoleIdentityAttributes.mockReturnValue(of(attrs) as any);

    service._identityAttributeRoleDetail$.pipe(take(2), toArray()).subscribe({
      next: (emissions) => {
        expect(emissions[0]).toBeNull();
        expect(emissions[1]).toEqual(attrs);
        done();
      }
    });

    service.getRoleIdentityAttributes(roleId).subscribe();
  });

  it('getRoleIdentityAttributes should call OpenAPI client and update BehaviorSubject', (done) => {
    const roleId = 'role-123';
    const attrs: IdentityAttribute[] = [
      { code: 'a1', name: 'Email' } as IdentityAttribute,
      { code: 'a2', name: 'Phone' } as IdentityAttribute,
    ];
    mockRolesServiceOpenApi.getRoleIdentityAttributes.mockReturnValue(of(attrs) as any);

    const values: Array<IdentityAttribute[] | null> = [];
    const sub = service._identityAttributeRoleDetail$.subscribe((v) => {
      values.push(v);
    });

    service.getRoleIdentityAttributes(roleId).subscribe({
      next: (result) => {
        expect(result).toEqual(attrs);
        expect(mockRolesServiceOpenApi.getRoleIdentityAttributes).toHaveBeenCalledWith(roleId);
        expect(values[0]).toBeNull();
        expect(values[1]).toEqual(attrs);
        sub.unsubscribe();
        done();
      },
    });
  });

  it('createNewRole should delegate to OpenAPI client and return the created role', (done) => {
    const payload: Role = {
      id: undefined,
      code: 'NEW',
      name: 'New Role',
      description: 'desc',
      enabled: true,
    } as Role;

    const created: Role = {
      id: 'r-999',
      code: 'NEW',
      name: 'New Role',
      description: 'desc',
      enabled: true,
    } as Role;

    mockRolesServiceOpenApi.createNewRole.mockReturnValue(of(created) as any);

    service.createNewRole(payload).subscribe({
      next: (res) => {
        expect(mockRolesServiceOpenApi.createNewRole).toHaveBeenCalledWith(payload);
        expect(res).toEqual(created);
        done();
      },
    });
  });

  it('getRoleList should delegate to OpenAPI client with correct params', (done) => {
    const page = 0, size = 10, sort: string[] = ['name,asc'], name = 'Admin', code = 'ADM';
    const roles: Role[] = [
      { id: 'r1', code: 'ADM', name: 'Admin', description: 'desc', enabled: true } as Role,
    ];
    mockRolesServiceOpenApi.searchRoles = jest.fn().mockReturnValue(of(roles) as any);

    service.getRoleList(page, size, sort, name, code).subscribe({
      next: (res) => {
        expect(mockRolesServiceOpenApi.searchRoles).toHaveBeenCalledWith(page, size, sort, code, null, name);
        expect(res).toEqual(roles);
        done();
      },
    });
  });

  it('getIdentityAttributeList should delegate to IdentityAttributesService with correct params', (done) => {
    const filters = {
      page: 1,
      size: 20,
      sort: ['code,desc'],
      code: 'EMAIL',
      name: 'Email',
      assignableToRoles: true,
      enabled: true,
      updateTimestampFrom: '2024-01-01T00:00:00.000Z',
      updateTimestampTo: '2024-01-31T23:59:59.000Z',
    } as any;
    const attrs: IdentityAttribute[] = [
      { code: 'EMAIL', name: 'Email' } as IdentityAttribute,
    ];
    (mockIdentityAttributesService.getDataspaceIdentityAttributes as jest.Mock) = jest
      .fn()
      .mockReturnValue(of(attrs) as any);

    service.getIdentityAttributeList(filters).subscribe({
      next: (res) => {
        expect(
          mockIdentityAttributesService.getDataspaceIdentityAttributes,
        ).toHaveBeenCalledWith(
          filters.page,
          filters.size,
          filters.sort,
          filters.code,
          filters.name,
          filters.assignableToRoles,
          filters.enabled,
          filters.updateTimestampFrom,
          filters.updateTimestampTo,
        );
        expect(res).toEqual(attrs);
        done();
      },
    });
  });

  it('roleDetail$ should emit initial null then role after getRoleDetail', (done) => {
    const roleId = 'r-42';
    const role: Role = { id: roleId, code: 'CODE', name: 'Name', description: 'D', enabled: true } as Role;
    mockRolesServiceOpenApi.getRoleById = jest.fn().mockReturnValue(of(role) as any);

    service.roleDetail$.pipe(take(2), toArray()).subscribe({
      next: (emissions) => {
        expect(emissions[0]).toBeNull();
        expect(emissions[1]).toEqual(role);
        done();
      }
    });

    service.getRoleDetail(roleId).subscribe();
  });

  it('assignIdentityAttributesToARole should delegate to OpenAPI client', (done) => {
    const roleId = 'r-assign';
    const attrs: IdentityAttribute[] = [
      { code: 'EMAIL', name: 'Email' } as IdentityAttribute,
      { code: 'PHONE', name: 'Phone' } as IdentityAttribute,
    ];
    const resp = { success: true } as any;
    mockRolesServiceOpenApi.updateRoleIdentityAttributes = jest.fn().mockReturnValue(of(resp) as any);

    service.assignIdentityAttributesToARole(roleId, attrs).subscribe({
      next: (res) => {
        expect(mockRolesServiceOpenApi.updateRoleIdentityAttributes).toHaveBeenCalledWith(roleId, attrs);
        expect(res).toEqual(resp);
        done();
      },
    });
  });

  it('editRole should delegate to OpenAPI client and return the updated role', (done) => {
    const roleId = 'r-edit-1';
    const payload: Role = {
      id: roleId,
      code: 'EDIT',
      name: 'Edit Role',
      description: 'before',
      enabled: true,
    } as Role;

    const updated: Role = {
      id: roleId,
      code: 'EDIT',
      name: 'Edit Role',
      description: 'after',
      enabled: false,
    } as Role;

    mockRolesServiceOpenApi.updateRoleById = jest.fn().mockReturnValue(of(updated) as any);

    service.editRole(roleId, payload).subscribe({
      next: (res) => {
        expect(mockRolesServiceOpenApi.updateRoleById).toHaveBeenCalledWith(roleId, payload);
        expect(res).toEqual(updated);
        done();
      },
    });
  });

  it('deleteRole should delegate to OpenAPI client and return the deleted role', (done) => {
    const roleId = 'r-del-1';
    const deleted: Role = {
      id: roleId,
      code: 'DEL',
      name: 'Deleted Role',
      description: 'desc',
      enabled: false,
    } as Role;

    mockRolesServiceOpenApi.deleteRoleById = jest.fn().mockReturnValue(of(deleted) as any);

    service.deleteRole(roleId).subscribe({
      next: (res) => {
        expect(mockRolesServiceOpenApi.deleteRoleById).toHaveBeenCalledWith(roleId);
        expect(res).toEqual(deleted);
        done();
      },
    });
  });
});
