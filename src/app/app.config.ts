import {Observable} from 'rxjs';
import {AppStarterService} from './app-starter.service';
import {TranslateModule} from '@ngx-translate/core';
import {
  CoreModule as EuiCoreModule,
  EUI_CONFIG_TOKEN,
  EuiServiceStatus,
  I18nService,
  LOCALE_ID_MAPPER,
  LocaleMapper, provideEuiInitializer,
  translateConfig
} from '@eui/core';

import {appConfig as euiAppConfig} from '../config';
import {environment} from '../environments/environment';
import {ApplicationConfig, importProvidersFrom, inject, LOCALE_ID, provideAppInitializer, isDevMode} from "@angular/core";
import {routes} from "./app.routes";
import {EuiDialogService} from "@eui/components/eui-dialog";
import {provideRouter, withRouterConfig, withComponentInputBinding} from "@angular/router";
import {
  createInterceptorCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  IncludeBearerTokenCondition,
  includeBearerTokenInterceptor,
  provideKeycloak
} from "keycloak-angular";
import {provideHttpClient, withInterceptors, withInterceptorsFromDi} from "@angular/common/http";
import {errorHandlingInterceptor} from "@shared/services/error-handler-interceptor.service";
import {API_URL} from "@shared/tokens";
import {provideAnimations} from "@angular/platform-browser/animations";
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import {provideTransloco} from "@jsverse/transloco";
import { I18nService as TranslocoI18nService } from '@shared/services/i18n.service';
import {provideApi as provideAuthenticationproviderV1Api} from "@simpl/api-client-authenticationprovider-v1";
import {provideApi as provideAuthenticationproviderTier1V2Api} from "@simpl/api-client-authenticationprovider-tier1-v2";
import {provideApi as provideUsersrolesTier1V2Api } from '@simpl/api-client-usersroles-tier1-v2';
import {loaderInterceptor} from "@shared/services/loader-interceptor";

/**
 * The provided function is injected at application startup and executed during
 * app initialization. If the function returns a Promise or an Observable, initialization
 * does not complete until the Promise is resolved or the Observable is completed.
 */
const init = (): Observable<EuiServiceStatus> => {
  const appStarter = inject(AppStarterService);
  return appStarter.start();
};

const urlCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern: /^https?:\/\/[^/]+(\/.*)?$/i,
  bearerPrefix: 'Bearer'
});



export const appConfig: ApplicationConfig = {
  providers: [
    provideAuthenticationproviderV1Api(environment.api_Url + '/authApi/v1'),
    provideAuthenticationproviderTier1V2Api(environment.api_Url + '/authApi/tier1/v2'),
    provideUsersrolesTier1V2Api(environment.api_Url + '/userApi/tier1/v2'),
    importProvidersFrom(
      EuiCoreModule.forRoot(),
      TranslateModule.forRoot(translateConfig),
    ),
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [urlCondition]
    },
    provideHttpClient(
      withInterceptorsFromDi(),
      withInterceptors([includeBearerTokenInterceptor, errorHandlingInterceptor, loaderInterceptor])
    ),
    provideRouter(routes, withComponentInputBinding(),  withRouterConfig({
      onSameUrlNavigation: 'reload'
    })),
    provideKeycloak({
      config: {
        clientId: environment.keycloakConfig_clientId,
        realm: environment.keycloakConfig_realm,
        url: environment.keycloakConfig_url,
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: document.baseURI + 'assets/silent-check-sso.html'
      },
    }),
    { provide: API_URL, useValue: environment.api_Url },
    {
      provide: EUI_CONFIG_TOKEN,
      useValue: { appConfig: euiAppConfig, environment }
    },
    {
      provide: LOCALE_ID_MAPPER,
      useFactory: (): LocaleMapper => {
        return (locale: string) => {
          switch (locale) {
            case 'it':
              return 'it-IT';
            // EDNEL: Map languages from Spain to their locales (start).
            case 'es':
              return 'es-ES';
            case 'ca':
              return 'ca-ES';
            case 'va':
              return 'va-ES';
            case 'gl':
              return 'gl-ES';
            case 'eu':
              return 'eu-ES';
            // EDNEL: Map languages from Spain to their locales (end).
            default:
              return 'en-GB';
          }
        };
      },
    },
    {
      provide: LOCALE_ID,
      useFactory: (service: I18nService, mapper: LocaleMapper): string => {
        return mapper(service.getSignal()().activeLang)
      },
      deps: [I18nService, LOCALE_ID_MAPPER]
    },
    provideAppInitializer(init),
    provideEuiInitializer(),
    AppStarterService,
    provideAnimationsAsync(),
    provideAnimations(),
    EuiDialogService,
    provideMomentDateAdapter(),
    provideTransloco({
      config: {
        // EDNEL: add Spanish and co-official languages of Spain, set Spanish as default (start)
        availableLangs: ['en', 'es', 'ca', 'va', 'gl', 'eu'],
        defaultLang: 'es',
        // EDNEL: add Spanish and co-official languages of Spain, set Spanish as default (end)
        prodMode: !isDevMode(),
        // EDNEL: rerender when selected language changes (start)
        reRenderOnLangChange: true,
        // EDNEL: rerender when selected language changes (end)
      },
      loader: TranslocoI18nService,
    })
  ],
};

