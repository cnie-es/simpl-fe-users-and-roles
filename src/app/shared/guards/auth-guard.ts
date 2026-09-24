import {
  ActivatedRouteSnapshot, CanActivateFn,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { inject } from "@angular/core";
import { UserService } from '@eui/core';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';

const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  authData: AuthGuardData,
): Promise<boolean> => {
  const userService: UserService = inject(UserService);
  const router = inject(Router);
  const { authenticated, grantedRoles, keycloak } = authData;

  if (!keycloak?.authenticated) {
      keycloak?.login({
       redirectUri: document.baseURI.replace(/\/$/, "") + state.url,
     });
  }

  userService.init({
    userId: keycloak?.tokenParsed?.['participant_id'],
    firstName: keycloak?.tokenParsed?.['given_name'],
    lastName: keycloak?.tokenParsed?.['family_name'],
    fullName: keycloak?.tokenParsed?.['name']
  })

  const requiredRoles = route.data['roles'];
  let granted: boolean | undefined = false;
  const roles = grantedRoles.realmRoles;

  if (!requiredRoles || requiredRoles.length === 0) {
    granted = true;
  } else {
    for (const requiredRole of requiredRoles) {
      if (roles.indexOf(requiredRole) > -1) {
        granted = true;
        break;
      }
    }
  }

  if (!granted) {
    await router.navigate(["/unauthorized"]);
  }
  return authenticated && granted;
};

export const canActivateAuthRole = createAuthGuard<CanActivateFn>(isAccessAllowed);
