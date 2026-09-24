import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { UserCreationPageComponent } from './user-creation-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UsersService } from '../users.service';
import { Observable, of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { KeycloakService } from 'keycloak-angular';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CONFIG_TOKEN, EuiAppConfig, I18nService, I18nState } from '@eui/core';
import { EuiAppModule } from '@eui/components/layout';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import {API_URL} from "@shared/tokens";
import en from "../../../assets/i18n/en.json"

describe('UserCreationPageComponent', () => {
  let component: UserCreationPageComponent;
  let fixture: ComponentFixture<UserCreationPageComponent>;
  const mockApiUrl = 'http://mock-api-url';
  let i18nServiceMock: jest.Mocked<I18nService>;
  let configMock: EuiAppConfig;
  configMock = {
    global: {},
    modules: { core: { base: 'localhost:3000', userDetails: 'dummy' } },
  };

  const mockUsersService = {
    getRoleList: jest.fn().mockReturnValue(of([])),
    createUser: jest.fn().mockReturnValue(of('mockUserId')),
    getAllRoles: jest.fn().mockReturnValue(of([])),
  };

  beforeEach(async () => {
    type GetStateReturnType<T> = T extends keyof I18nState
      ? Observable<I18nState[T]>
      : Observable<I18nState>;
    configMock = {
      global: {},
      modules: { core: { base: 'localhost:3000', userDetails: 'dummy' } },
    };
    i18nServiceMock = {
      init: jest.fn(),
      getState: jest.fn(
        <K extends keyof I18nState>(key?: K): GetStateReturnType<K> => {
          if (typeof key === 'string') {
            return of({ activeLang: 'en' }[key]) as GetStateReturnType<K>;
          }
          return of({ activeLang: 'en' }) as GetStateReturnType<K>;
        }
      ),
    } as unknown as jest.Mocked<I18nService>;

    configMock = {
      global: {},
      modules: { core: { base: 'localhost:3000', userDetails: 'dummy' } },
    };

    await TestBed.configureTestingModule({
      imports: [
        EuiAppModule,
        TranslateModule.forRoot(),
        CommonModule,
        UserCreationPageComponent,
        HttpClientTestingModule,
        TranslocoTestingModule.forRoot(
          {
            translocoConfig: {
              availableLangs: ["en"],
              defaultLang: "en",
            },
            langs: { en: en }
          }
        ),
        NoopAnimationsModule,
      ],
      providers: [
        KeycloakService,
        provideHttpClient(),
        { provide: UsersService, useValue: mockUsersService },
        { provide: ActivatedRoute, useValue: { snapshot: {} } },
        { provide: API_URL, useValue: mockApiUrl },
        { provide: I18nService, useValue: i18nServiceMock },
        { provide: CONFIG_TOKEN, useValue: configMock },
      ],
    }).overrideComponent(UserCreationPageComponent, {
      add: {
        schemas: [NO_ERRORS_SCHEMA],
      },
    }).compileComponents();

    fixture = TestBed.createComponent(UserCreationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getRoleList on ngOnInit', () => {
    expect(mockUsersService.getAllRoles).toHaveBeenCalled();
  });

  it('should not call createUser if form is invalid', () => {
    component.userForm.setValue({
      email: '',
      firstName: '',
      lastName: '',
      username: '',
      enabled: true,
      password: '',
      confirmPassword: '',
      roles: [],
    });

    component.onSubmit();

    expect(mockUsersService.createUser).not.toHaveBeenCalled();
  });

  it('should call createUser and updateUserRoles if form is valid', () => {
    component.userForm.setValue({
      email: 'test@example.com',
      firstName: 'Marco',
      lastName: 'Rossi',
      username: 'marcorossi',
      enabled: true,
      password: 'Password1234567!',
      confirmPassword: 'Password1234567!',
      roles: [{ id: 'ADMIN', label: 'admin' }],
    });

    const exp = {
      email: 'test@example.com',
      firstName: 'Marco',
      lastName: 'Rossi',
      username: 'marcorossi',
      enabled: true,
      password: 'Password1234567!',
      confirmPassword: 'Password1234567!',
      roles: ['ADMIN'],
    };

    component.onSubmit();
    expect(mockUsersService.createUser).toHaveBeenCalledWith(exp);
  });
});
