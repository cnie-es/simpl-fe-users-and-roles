import { homeRedirectGuard } from './home-redirect-guard';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('homeRedirectGuard', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    delete (window as any).location;
    window.location = {
      assign: jest.fn(),
    } as any;
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it('should redirect to root domain and return false', () => {
    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = homeRedirectGuard(route, state);

    expect(window.location.assign).toHaveBeenCalledWith('/');
    expect(result).toBe(false);
  });
});
