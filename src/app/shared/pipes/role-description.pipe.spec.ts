import { TestBed } from '@angular/core/testing';
import { TranslocoService, TranslocoTestingModule, translocoConfig } from '@jsverse/transloco';
import { RoleDescriptionPipe } from './role-description.pipe';
import en from '../../../assets/i18n/en.json';

describe('RoleDescriptionPipe', () => {
  let pipe: RoleDescriptionPipe;

  const translations: Record<string, string> = {
    'roleDescriptions.SD_CONSUMER': 'Rol de Nivel 1 (Tier 1) para el consumidor de datos.'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RoleDescriptionPipe,
        {
          provide: TranslocoService,
          useValue: {
            translate: jest.fn((key: string) => translations[key] ?? key)
          }
        }
      ]
    });

    pipe = TestBed.inject(RoleDescriptionPipe);
  });

  it('should create the pipe', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the translated description of a known role', () => {
    const result = pipe.transform({ code: 'SD_CONSUMER', description: 'Tier-1 Role for Consumer' });
    expect(result).toBe('Rol de Nivel 1 (Tier 1) para el consumidor de datos.');
  });

  it('should fall back to the description when the role has no translation', () => {
    const result = pipe.transform({ code: 'CUSTOM_ROLE', description: 'A custom role' });
    expect(result).toBe('A custom role');
  });

  it('should fall back to the description when the role has no code', () => {
    const result = pipe.transform({ description: 'A role without code' });
    expect(result).toBe('A role without code');
  });

  it('should strip the Keycloak message placeholder from the fallback description', () => {
    const result = pipe.transform({ code: 'default-roles-participant', description: '${role_default-roles}' });
    expect(result).toBe('role_default-roles');
  });

  it('should return an empty string when there is no role or no description', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform({ code: 'NO_DESCRIPTION' })).toBe('');
  });
});

describe('RoleDescriptionPipe with the real translation bundle', () => {
  let pipe: RoleDescriptionPipe;
  let translocoService: TranslocoService;

  /** The roles of the EDNEL portal, whose code is the Keycloak role name, spaces included. */
  const ednelRoleCodes = [
    'G-Administrator',
    'G-Content Editor',
    'G-Operator',
    'G-Portal Manager',
    'G-Tech Operator',
    'P-Connector Administrator',
    'P-Data Consumer',
    'P-Data Offer Manager',
    'P-Data Provider',
    'P-Financial Administrator',
    'P-Legal Representative',
    'P-User Administrator'
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          translocoConfig: translocoConfig({
            availableLangs: ['en'],
            defaultLang: 'en',
            reRenderOnLangChange: true,
          }),
          langs: { en },
        }),
      ],
      providers: [RoleDescriptionPipe]
    });

    pipe = TestBed.inject(RoleDescriptionPipe);
    translocoService = TestBed.inject(TranslocoService);

    // `translate` is synchronous and the testing module loads the bundles lazily, so nothing would
    // be translated without setting the translation up front: this spec never renders a template.
    translocoService.setTranslation(en, 'en');
    translocoService.setActiveLang('en');
  });

  it('should resolve a translation key that contains spaces', () => {
    expect(translocoService.translate('roleDescriptions.P-Connector Administrator'))
      .toBe(en.roleDescriptions['P-Connector Administrator']);
  });

  it('should translate a role whose code contains spaces', () => {
    const result = pipe.transform({
      code: 'P-Connector Administrator',
      description: "Installs and manages the Participant's EDNEL connector(s). Appoints the Participant's User Administrator role"
    });

    expect(result).toBe(en.roleDescriptions['P-Connector Administrator']);
  });

  it('should translate every EDNEL portal role', () => {
    const untranslated = ednelRoleCodes
      .filter(code => pipe.transform({ code, description: 'untranslated' }) === 'untranslated');

    expect(untranslated).toEqual([]);
  });
});
