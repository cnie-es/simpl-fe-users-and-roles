import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EuiGrowlService } from '@eui/core';

// EDNEL imports (start)
import { HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
// EDNEL imports (end)

const errorRoutesMap = new Map<string, string[]>([
  ['400', ['documents', 'credentials', 'keypairs/import']],
  ['404', ['/certificate', '/credential-validity', '/credentials']],
  ['409', ['/onboarding-request']],
  ['503', ['/agent']],
  ['404', ['/keypairs']],
]);

// EDNEL definitions (start)
const languagesNotOfficialInEU = ['ca', 'va', 'gl', 'eu'];
const translationDirs = ['i18n-ecl', 'i18n-eui'];
// EDNEL definitions (end)

export const errorHandlingInterceptor = (
  request: HttpRequest<any>,
  next: HttpHandlerFn,
): Observable<HttpEvent<any>> => {
  const euiGrowlService = inject(EuiGrowlService);
  const router = inject(Router);

  // EDNEL: short-circuit requests for missing translation files for non EU official languages (start)
  if (languagesNotOfficialInEU.some(lang => translationDirs.some(dirName => request.url.includes(`assets/${dirName}/${lang}.json`)))) {
    return of(new HttpResponse<unknown>({ status: 200, body: {}, url: request.url }));
  }
  // EDNEL: short-circuit requests for missing translation files for non EU official languages (end)

  return next(request).pipe(
    catchError((error) => {

      const errorsRedirect = [
        400, 401, 403,
        404, 500, 501,
        502, 503,  504,
        505,  508,  511
      ]
      if (error instanceof HttpErrorResponse) {

        if (shouldThrowError(error.status, request.url)) {
          return throwError(() => error);
        }

        if ( errorsRedirect.includes(error.status) || (error.status >= 500 && error.status < 600)) {
          const errorInfo = {
            status: error.status,
            statusText: error.statusText,
            name: error.name,
            message: error.message,
            url: error.url,
            error: error.error
          };
          router.navigate(['/error'], {
            state: { error: errorInfo }
          });
        }
        else {
          euiGrowlService.growlError(error.message)
        }
      }
      return throwError(() => error);
    }),
  );
};

function shouldThrowError(status: number, url: string): boolean {
  const routes = errorRoutesMap.get(status.toString());
  return routes ? routes.some(route => url.includes(route)) : false;
}
