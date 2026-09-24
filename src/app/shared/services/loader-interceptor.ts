import {inject} from '@angular/core';
import {HttpEvent, HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {AppStarterService} from "../../app-starter.service";


export const loaderInterceptor = (
  request: HttpRequest<any>,
  next: HttpHandlerFn,
): Observable<HttpEvent<any>> => {

  const appStarterService = inject(AppStarterService);
  appStarterService.isDocumentBlocked.set(true);
  // console.log(request)
  return next(request).pipe(
    finalize(() => {
      appStarterService.isDocumentBlocked.set(false);
    })
  )
}
