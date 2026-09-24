import {HttpRequest} from '@angular/common/http';
import {of, throwError} from 'rxjs';
import {loaderInterceptor} from './loader-interceptor';
import {inject, signal} from "@angular/core";
import {AppStarterService} from "../../app-starter.service";

jest.mock("@angular/core", () => ({
  ...jest.requireActual("@angular/core"),
  inject: jest.fn(),
}));

let mockAppStarterService = {
  isDocumentBlocked: signal(false)
};

describe('loaderInterceptor', () => {
  beforeEach(() => {

    (inject as jest.Mock).mockImplementation((token) => {
      if (token === AppStarterService) {
        return mockAppStarterService;
      }
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('clears isDocumentBlocked after successful completion', () => {
    const request = new HttpRequest('GET', '/test');
    const next = jest.fn(() => of({} as any));

    loaderInterceptor(request, next).subscribe();

    expect(mockAppStarterService.isDocumentBlocked()).toBe(false);
  });

  test('clears isDocumentBlocked after an error', () => {
    const request = new HttpRequest('GET', '/test');
    const next = jest.fn(() => throwError(() => new Error('fail')));

    loaderInterceptor(request, next).subscribe({
      error: () => undefined,
    });

    expect(mockAppStarterService.isDocumentBlocked()).toBe(false);
  });
});
