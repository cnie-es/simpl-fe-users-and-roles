import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot
} from "@angular/router";
import { inject } from "@angular/core";
import { UserService } from '@eui/core';
import { AuthGuardData } from 'keycloak-angular';
import { canActivateAuthRole } from './auth-guard';

jest.mock("@angular/core", () => ({
  ...jest.requireActual("@angular/core"),
  inject: jest.fn(),
}));

describe("canActivateAuthRole", () => {
  let mockRouter: jest.Mocked<Router>;
  let mockUserService: jest.Mocked<UserService>;
  let mockKeycloak: any;

  beforeEach(() => {
    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<Router>;

    mockUserService = {
      init: jest.fn()
    } as unknown as jest.Mocked<UserService>;

    mockKeycloak = {
      authenticated: true,
      login: jest.fn(),
      tokenParsed: {
        participant_id: '123',
        given_name: 'Mario',
        family_name: 'Rossi',
        name: 'Mario Rossi'
      }
    };

    (inject as jest.Mock).mockImplementation((token) => {
      if (token === Router) {
        return mockRouter;
      }
      if (token === UserService) {
        return mockUserService;
      }

      return mockKeycloak;
    });

    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should allow access if no roles are required", async () => {
    const route = {
      data: {},
    } as unknown as ActivatedRouteSnapshot;
    const state = { url: "/dashboard" } as RouterStateSnapshot;

    const result = await canActivateAuthRole(route, state);

    expect(result).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it("should allow access if roles array is empty", async () => {
    const route = {
      data: { roles: [] },
    } as unknown as ActivatedRouteSnapshot;
    const state = { url: "/dashboard" } as RouterStateSnapshot;

    const result = await canActivateAuthRole(route, state);

    expect(result).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it("should deny access and navigate to unauthorized if user lacks required role", async () => {
    const route = {
      data: { roles: ["ROLE_ADMIN"] },
    } as unknown as ActivatedRouteSnapshot;
    const state = { url: "/admin" } as RouterStateSnapshot;

    const result = await canActivateAuthRole(route, state);

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(["/unauthorized"]);
  });

  it("should redirect to login if user is not authenticated", async () => {
    const route = {
      data: { roles: ["ROLE_USER"] },
    } as unknown as ActivatedRouteSnapshot;
    const state = { url: "/dashboard" } as RouterStateSnapshot;

    mockKeycloak.authenticated = false;

    Object.defineProperty(document, 'baseURI', {
      value: 'http://localhost:4200/',
      configurable: true
    });

    const result = await canActivateAuthRole(route, state);

    expect(mockKeycloak.login).toHaveBeenCalledWith({
      redirectUri: "http://localhost:4200/dashboard"
    });
    expect(result).toBe(false);
  });

  it("should handle keycloak instance being undefined", async () => {
    const route = {
      data: { roles: ["ROLE_USER"] },
    } as unknown as ActivatedRouteSnapshot;
    const state = { url: "/dashboard" } as RouterStateSnapshot;

    const result = await canActivateAuthRole(route, state);

    expect(result).toBe(false);
  });

  it("should initialize UserService with undefined values when tokenParsed is missing", async () => {
    const route = {
      data: {},
    } as unknown as ActivatedRouteSnapshot;
    const state = { url: "/dashboard" } as RouterStateSnapshot;

    mockKeycloak.tokenParsed = undefined;

    const authData: AuthGuardData = {
      authenticated: true,
      grantedRoles: { realmRoles: [], resourceRoles: {} },
      keycloak: mockKeycloak
    };

    await canActivateAuthRole(route, state);

    expect(mockUserService.init).toHaveBeenCalledWith({
      userId: undefined,
      firstName: undefined,
      lastName: undefined,
      fullName: undefined
    });
  });

  it("should handle baseURI without trailing slash correctly", async () => {
    const route = {
      data: { roles: ["ROLE_USER"] },
    } as unknown as ActivatedRouteSnapshot;
    const state = { url: "/dashboard" } as RouterStateSnapshot;

    mockKeycloak.authenticated = false;

    Object.defineProperty(document, 'baseURI', {
      value: 'http://localhost:4200',
      configurable: true
    });

    await canActivateAuthRole(route, state);

    expect(mockKeycloak.login).toHaveBeenCalledWith({
      redirectUri: "http://localhost:4200/dashboard"
    });
  });

  it("should deny access if authenticated but not granted", async () => {
    const route = {
      data: { roles: ["ROLE_ADMIN"] },
    } as unknown as ActivatedRouteSnapshot;
    const state = { url: "/admin" } as RouterStateSnapshot;

    const result = await canActivateAuthRole(route, state);

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(["/unauthorized"]);
  });
});
