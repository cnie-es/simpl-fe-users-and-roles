import {inject, Injectable, signal} from '@angular/core';
import {
    I18nService,
    EuiServiceStatus, EuiAppConfig, CONFIG_TOKEN
} from '@eui/core';
import { Observable } from 'rxjs';

import { registerLocaleData } from '@angular/common';
import enGB from "@angular/common/locales/en-GB";
registerLocaleData(enGB);

// EDNEL: register locale data for main languages of Spain (start)
import esES from "@angular/common/locales/es";
import caES from "@angular/common/locales/ca";
import glES from "@angular/common/locales/gl";
import euES from "@angular/common/locales/eu";
import itIT from "@angular/common/locales/it";
registerLocaleData(esES, 'es-ES');
registerLocaleData(caES, 'ca-ES');
registerLocaleData(caES, 'va-ES');  // Valencian uses Catalan locale data
registerLocaleData(glES, 'gl-ES');
registerLocaleData(euES, 'eu-ES');
registerLocaleData(itIT, 'it-IT');
// EDNEL: register locale data for main languages of Spain (end)


@Injectable({
    providedIn: 'root',
})
export class AppStarterService {

    private readonly i18nService: I18nService = inject(I18nService);
    private readonly config: EuiAppConfig = inject(CONFIG_TOKEN);

    isDocumentBlocked = signal(false);

    start(): Observable<EuiServiceStatus> {
        return this.i18nService.init({
            activeLang: this.config.global.user?.defaultUserPreferences?.lang ?? 'en-GB',
        })
    }
}
