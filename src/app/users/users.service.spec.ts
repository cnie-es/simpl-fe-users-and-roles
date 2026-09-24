import { TestBed } from '@angular/core/testing';
import { HttpEvent } from '@angular/common/http';
import { UsersService } from './users.service';
import { of } from 'rxjs';
import {
  RolesService,
  Role,
  UsersService as UsersServiceOpenApiV2,
  User,
  RoleAssignmentRequest,
} from '@simpl/api-client-usersroles-tier1-v2';

describe('UsersService', () => {
  let service: UsersService;
  let mockUsersServiceOpenApiV2: jest.Mocked<UsersServiceOpenApiV2>;
  let mockRolesService: jest.Mocked<RolesService>;

  beforeEach(() => {
    mockUsersServiceOpenApiV2 = {
      searchUsers: jest.fn(),
      getUserRoles: jest.fn(),
      createNewUser: jest.fn(),
      updateUserRoles: jest.fn(),
      deleteUserById: jest.fn().mockReturnValue(of({ success: true })),
    } as unknown as jest.Mocked<UsersServiceOpenApiV2>;

    mockRolesService = {
      searchRoles: jest.fn(),
    } as unknown as jest.Mocked<RolesService>;

    TestBed.configureTestingModule({
      providers: [
        UsersService,
        { provide: UsersServiceOpenApiV2, useValue: mockUsersServiceOpenApiV2 },
        { provide: RolesService, useValue: mockRolesService },
      ],
    });

    service = TestBed.inject(UsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get user list with no filters', () => {
    const mockResponse = [{ id: '1', username: 'test' }];

    mockUsersServiceOpenApiV2.searchUsers.mockReturnValue(
      of(mockResponse as unknown as HttpEvent<any>)
    );

    service.getUserList().subscribe((users) => {
      expect(users).toEqual(mockResponse);
    });

    expect(mockUsersServiceOpenApiV2.searchUsers).toHaveBeenCalledWith(
undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    );
  });

  it('should get user list with filters', () => {
    const mockResponse = [{ id: '1', username: 'test' }];

    mockUsersServiceOpenApiV2.searchUsers.mockReturnValue(
      of(mockResponse as unknown as HttpEvent<any>)
    );

    service
      .getUserList(null, null, 'firstName', 'lastName', 'username', 'email@test.com')
      .subscribe((users) => {
        expect(users).toEqual(mockResponse);
      });

    expect(mockUsersServiceOpenApiV2.searchUsers).toHaveBeenCalledWith(
      null,
      null,
      'firstName',
      'lastName',
      'username',
      'email@test.com'
    );
  });

  it('should get user roles', () => {
    const userId = '123';
    const mockRoles: Role[] = [
      { id: '1', code: 'ADMIN', name: 'Admin', enabled: true },
      { id: '2', code: 'USER', name: 'User', enabled: true },
    ];

    mockUsersServiceOpenApiV2.getUserRoles.mockReturnValue(
      of(mockRoles as unknown as HttpEvent<Role[]>)
    );

    service.getUserRoles(userId).subscribe((roles) => {
      expect(roles).toEqual(mockRoles);
    });

    expect(mockUsersServiceOpenApiV2.getUserRoles).toHaveBeenCalledWith(userId);
  });

  it('should create user', () => {
    const mockUser = {
      id: '1',
      username: 'test',
      email: 'test@test.com',
    } as User;
    const mockResponse = mockUser;

    mockUsersServiceOpenApiV2.createNewUser.mockReturnValue(
      of(mockResponse as unknown as HttpEvent<any>)
    );

    service.createUser(mockUser).subscribe((response) => {
      expect(response).toBe(mockResponse);
    });

    expect(mockUsersServiceOpenApiV2.createNewUser).toHaveBeenCalledWith(
      mockUser
    );
  });

  it('should get role list and map items', () => {
    const mockRoles: Role[] = [
      { id: '1', code: 'ADMIN', name: 'Admin', enabled: true },
      { id: '2', code: 'USER', name: 'User', enabled: true },
    ];

    mockRolesService.searchRoles.mockReturnValue(
      of({ items: mockRoles } as unknown as HttpEvent<any>)
    );

    service.getAllRoles().subscribe((roles) => {
      expect(roles).toEqual(mockRoles);
    });

    expect(mockRolesService.searchRoles).toHaveBeenCalledWith(
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      true
    );
  });

  it('should return empty array when roles response has no items', () => {
    mockRolesService.searchRoles.mockReturnValue(
      of({ items: [] } as unknown as HttpEvent<any>)
    );

    service.getAllRoles().subscribe((roles) => {
      expect(roles).toEqual([]);
    });
  });

  it('should update user roles', () => {
    const userId = '123';
    const rolesRequest: RoleAssignmentRequest = { rolesIds: ['ROLE_ADMIN', 'ROLE_USER'] };
    const mockResponse = { success: true };

    mockUsersServiceOpenApiV2.updateUserRoles.mockReturnValue(
      of(mockResponse as unknown as HttpEvent<any>)
    );

    service.updateUserRoles(userId, rolesRequest).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    expect(mockUsersServiceOpenApiV2.updateUserRoles).toHaveBeenCalledWith(
      userId,
      rolesRequest
    );
  });

  it('should call delete User Api', () => {
    service.deleteUser('123').subscribe(() => {
      expect(mockUsersServiceOpenApiV2.deleteUserById).toHaveBeenCalledWith(
        '123'
      );
    });
  });
});
