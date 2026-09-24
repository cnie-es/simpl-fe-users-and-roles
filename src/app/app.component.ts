import {Component, inject} from '@angular/core';
import {EUI_LANGUAGE_SELECTOR} from "@eui/components/eui-language-selector";
import {EUI_USER_PROFILE} from "@eui/components/eui-user-profile";
import {EUI_ICON} from "@eui/components/eui-icon";
import {EuiLayoutModule} from "@eui/components/layout";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import Keycloak from "keycloak-js";
import {EUI_BLOCK_CONTENT} from "@eui/components/eui-block-content";
import {AppStarterService} from "./app-starter.service";
import {EUI_LABEL} from "@eui/components/eui-label";

// EDNEL imports (start)
import { EuiAppShellService, EuiLanguage } from '@eui/core';
import { TranslocoService } from '@jsverse/transloco';
import { distinctUntilChanged, filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateAdapter } from '@angular/material/core';
// EDNEL imports (end)

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
  imports: [
    TranslateModule,
    EuiLayoutModule,
    ...EUI_ICON,
    ...EUI_USER_PROFILE,
    ...EUI_LANGUAGE_SELECTOR,
    EUI_BLOCK_CONTENT,
    EUI_LABEL,
  ],
})
export class AppComponent {
  // EDNEL: Inject translation related services (start)
  private readonly appShellService = inject(EuiAppShellService);
  private readonly translocoService = inject(TranslocoService);
  private readonly dateAdapter = inject(DateAdapter);
  private readonly translateService = inject(TranslateService);
  private readonly langSelectorObserver = new MutationObserver(() => this.updateLanguageSelectorHeadings());
  // EDNEL: Inject translation related services (end)

  constructor() {
    if (this.keycloak.authenticated) {
      document.body.classList.add('simpl-splash-screen-hidden');
    }

    // EDNEL translations (start)
    this.appShellService.getState<string>('activeLanguage')
      .pipe(
        filter(Boolean),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((lang: string) => {
        this.translocoService.setActiveLang(lang);
        // Map locale to Moment.js format (va-ES -> ca, es-ES -> es, etc.)
        const momentLocale = this.mapToMomentLocale(lang);
        this.dateAdapter.setLocale(momentLocale);
        this.updateLanguageSelectorHeadings();
      });
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.translateLanguageLabels()
      });
    // Initial translation of language labels
    this.translateLanguageLabels()
    // EDNEL translations (end)
  }

  // EDNEL: Map Angular locale to Moment.js locale format (start)
  private mapToMomentLocale(angularLocale: string): string {
    // Valencian uses Catalan locale in Moment.js
    if (angularLocale === 'va-ES' || angularLocale === 'va') {
      return 'ca';
    }
    // Remove country code suffix (e.g., es-ES -> es, ca-ES -> ca)
    const locale = angularLocale.split('-')[0];
    return locale;
  }
  // EDNEL: Map Angular locale to Moment.js locale format (end)

  readonly appStarterService = inject(AppStarterService)
  readonly keycloak: Keycloak = inject(Keycloak);
  logOut() {
    const baseUrl = window.location.origin;
    const onboardingPath = window.location.pathname.includes('/users-roles')
      ? '/users-roles/'
      : '/';

    this.keycloak.logout({ redirectUri: `${baseUrl}${onboardingPath}` }).then();
  }

  ngAfterViewInit(): void {
    this.langSelectorObserver.observe(document.body, { childList: true, subtree: true });
  }

  ngOnDestroy(): void {
    this.langSelectorObserver?.disconnect();
  }

  private translateLanguageLabels(){
    const updatedLanguages = (this.appShellService.state.languages as EuiLanguage[])
      .map(({ code, label }) => {
        let newLabel: string = this.translateService.instant('languageSelector.languageLabels.' + code);
        // If the translation key is missing, keep the original label
        if (newLabel.includes('.')){
          newLabel = label;
        }
        return({
        code,
        label: newLabel,
      })});
    this.appShellService.setState({...this.appShellService.state, languages: updatedLanguages})
  }

  private updateLanguageSelectorHeadings(): void {
    const headings = document.querySelectorAll('eui-modal-selector h4');
    if (headings.length !== 2) return;
    // Disconnect the observer to prevent infinite loops when updating the headings
    this.langSelectorObserver?.disconnect();
    headings[0].textContent = this.translateService.instant('languageSelector.headings.euOfficial');
    headings[1].textContent = this.translateService.instant('languageSelector.headings.nonEuOfficial');
    // Re-observe the DOM after updating the headings
    this.langSelectorObserver?.observe(document.body, { childList: true, subtree: true });
  }
}
