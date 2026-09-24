import {CanActivateFn} from "@angular/router";

/** Redirects to the root domain, canceling Angular navigation */
export const homeRedirectGuard: CanActivateFn = () => {
  window.location.assign('/'); // Redirection to the root domain
  return false; // Cancel Angular navigation since we're doing a full page reload
};
