import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import Keycloak from 'keycloak-js';
import { of } from 'rxjs';
import { EuiAppShellService } from '@eui/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { EuiAppComponent } from '@eui/components/layout';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { AppStarterService } from './app-starter.service';
import { DateAdapter } from '@angular/material/core';

class MockKeycloak {
  authenticated = true;
  logout = jest.fn(() => Promise.resolve());
}

describe('AppComponent EDNEL behaviors', () => {
  let component: AppComponent;
  let mockAppShellService: {
    isBlockDocumentActive: boolean;
    setState: jest.Mock;
    getState: jest.Mock;
    state: { languages: { code: string; label: string }[] };
  };
  let translateService: TranslateService;

  beforeEach(async () => {
    mockAppShellService = {
      isBlockDocumentActive: false,
      setState: jest.fn(),
      getState: jest.fn(() => of('es')),
      state: { languages: [] },
    };

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        TranslocoTestingModule.forRoot({
          translocoConfig: { availableLangs: ['es', 'ca'], defaultLang: 'es' },
          langs: {},
        }),
      ],
      providers: [
        { provide: EuiAppShellService, useValue: mockAppShellService },
        { provide: AppStarterService, useValue: { isDocumentBlocked: signal(false) } },
        { provide: Keycloak, useClass: MockKeycloak },
        { provide: DateAdapter, useValue: { setLocale: jest.fn() } },
      ],
    })
      .overrideComponent(AppComponent, {
        add: { schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA] },
        remove: { imports: [EuiAppComponent] },
      })
      .compileComponents();

    translateService = TestBed.inject(TranslateService);
    component = TestBed.createComponent(AppComponent).componentInstance;
    // Clear calls produced during construction so tests start with a clean slate
    mockAppShellService.setState.mockClear();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  describe('language labels updated on language change', () => {
    it('should translate language labels when the active language changes', () => {
      translateService.setTranslation('es', {
        languageSelector: {
          languageLabels: { es: 'Español', ca: 'Catalán' },
        },
      });
      translateService.setTranslation('ca', {
        languageSelector: {
          languageLabels: { es: 'Castellà', ca: 'Català' },
        },
      });
      mockAppShellService.state.languages = [
        { code: 'es', label: 'Spanish' },
        { code: 'ca', label: 'Catalan' },
      ];

      translateService.use('es');

      expect(mockAppShellService.setState).toHaveBeenCalledWith(
        expect.objectContaining({
          languages: [
            { code: 'es', label: 'Español' },
            { code: 'ca', label: 'Catalán' },
          ],
        })
      );
      translateService.use('ca');

      expect(mockAppShellService.setState).toHaveBeenCalledWith(
        expect.objectContaining({
          languages: [
            { code: 'es', label: 'Castellà' },
            { code: 'ca', label: 'Català' },
          ],
        })
      );
    });

    it('should keep the original label when a translation key is missing', () => {
      translateService.setTranslation('es', {
        languageSelector: {
          languageLabels: { es: 'Español' }, // 'ca' key is absent
        },
      });
      mockAppShellService.state.languages = [
        { code: 'es', label: 'Spanish' },
        { code: 'ca', label: 'Catalan' },
      ];

      translateService.use('es');

      expect(mockAppShellService.setState).toHaveBeenCalledWith(
        expect.objectContaining({
          languages: [
            { code: 'es', label: 'Español' },
            { code: 'ca', label: 'Catalan' },
          ],
        })
      );
    });
  });

  describe('language selector headings translated when the selector opens', () => {
    let modal: HTMLElement;

    afterEach(() => {
      if (modal?.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    });

    it('should set both heading texts to translated values when the modal appears', async () => {
      translateService.setTranslation('gl', {
        languageSelector: {
          headings: {
            euOfficial: 'Idiomas oficiais da UE',
            nonEuOfficial: 'Idiomas non oficiais na UE',
          },
        },
      });
      translateService.use('gl');

      component.ngAfterViewInit();

      const h4a = document.createElement('h4');
      const h4b = document.createElement('h4');
      modal = document.createElement('eui-modal-selector');
      modal.appendChild(h4a);
      modal.appendChild(h4b);
      document.body.appendChild(modal);

      // Allow the MutationObserver microtask to run
      await Promise.resolve();

      expect(h4a.textContent).toBe('Idiomas oficiais da UE');
      expect(h4b.textContent).toBe('Idiomas non oficiais na UE');
    });

    it('should not update headings when fewer than 2 h4 elements are present', async () => {
      const instantSpy = jest.spyOn(translateService, 'instant');

      component.ngAfterViewInit();

      const h4a = document.createElement('h4');
      modal = document.createElement('eui-modal-selector');
      modal.appendChild(h4a);
      document.body.appendChild(modal);

      await Promise.resolve();

      expect(instantSpy).not.toHaveBeenCalledWith('languageSelector.headings.euOfficial');
    });
  });
});
