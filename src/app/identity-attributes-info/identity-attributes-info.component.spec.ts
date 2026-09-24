import {ComponentFixture, TestBed} from '@angular/core/testing';
import {translate, TranslocoTestingModule} from '@jsverse/transloco';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule, HttpTestingController,} from '@angular/common/http/testing';
import {CommonModule} from '@angular/common';
import {Observable, of} from 'rxjs';
import {provideHttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {IdentityAttributesInfoComponent} from './identity-attributes-info.component';
import {CONFIG_TOKEN, EuiAppConfig, EuiAppShellService, I18nService, I18nState} from '@eui/core';
import {EuiAppModule} from '@eui/components/layout';
import {TranslateModule} from '@ngx-translate/core';
import {EuiChip} from '@eui/components/eui-chip';
import moment from 'moment-timezone';
import {API_URL} from "@shared/tokens";
import en from "../../assets/i18n/en.json"

describe('IdentityAttributesInfo', () => {
  let component: IdentityAttributesInfoComponent;
  let fixture: ComponentFixture<IdentityAttributesInfoComponent>;
  let httpTestingController: HttpTestingController;
  const mockApiUrl = 'http://mock-api-url';
  let i18nServiceMock: jest.Mocked<I18nService>;
  let configMock: EuiAppConfig;

  const growlService = {
    growl: jest.fn()
  }
  const appShellService = {
    isBlockDocumentActive: false
  }

  configMock = {
    global: {},
    modules: { core: { base: 'localhost:3000', userDetails: 'dummy' } },
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
        IdentityAttributesInfoComponent,
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
        provideHttpClient(),
        { provide: ActivatedRoute, useValue: { snapshot: {} } },
        { provide: API_URL, useValue: mockApiUrl },
        { provide: I18nService, useValue: i18nServiceMock },
        { provide: CONFIG_TOKEN, useValue: configMock },
        { provide: EuiAppShellService, useValue: appShellService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IdentityAttributesInfoComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch identity attributes list and update data correctly', () => {
    const mockResponse = {
      items: [
        {
          id: '1',
          name: 'Attribute1',
          code: 'ATTR1',
          assignableToRoles: true,
          enabled: true,
        },
      ],
      page: { totalElements: 1 },
    } as unknown as any;

    jest
      .spyOn(
        component['_identityAttributesService'],
        'getDataspaceIdentityAttributes'
      )
      .mockReturnValue(of(mockResponse));
    const loadingSpy = jest.spyOn(component.loading, 'set');

    component.getIdentityAttributeList();

    expect(loadingSpy).toHaveBeenNthCalledWith(1, true);
    expect(component.data).toEqual(mockResponse.items);
    expect(component.totalElements).toEqual(mockResponse.total);
    expect(loadingSpy).toHaveBeenNthCalledWith(2, false);
  });

  it('should reset filters and fetch identity attributes list', () => {
    const spy = jest.spyOn(component, 'getIdentityAttributeList');

    component.resetFilters();

    expect(component.identityAttributesFiltersForm.value).toEqual({
      name: '',
      code: '',
      updateTimestamp: { startRange: null, endRange: null },
    });
    expect(spy).toHaveBeenCalled();
  });

  it('should call getIdentityAttributeList when the page changes', () => {
    const spy = jest.spyOn(component, 'getIdentityAttributeList');
    const newPage = { page: 1, pageSize: 10, nbPage: 5 };

    component.onPageChange(newPage);

    expect(component.pagination).toEqual(newPage);
    expect(spy).toHaveBeenCalled();
  });

  it('should remove a chip and update filters correctly', () => {
    const spy = jest.spyOn(component, 'getIdentityAttributeList');

    const startDate = moment(new Date());
    const endDate = moment(new Date());
    component.identityAttributesFiltersForm.patchValue({
      name: 'TestName',
      code: 'TestCode',
      updateTimestamp: { startRange: startDate, endRange: endDate },
    });
    const chipToRemove = { id: 'name' } as EuiChip;

    component.removeChip(chipToRemove);

    expect(component.identityAttributesFiltersForm.value).toEqual({
      name: null,
      code: 'TestCode',
      updateTimestamp: { startRange: startDate, endRange: endDate },
    });
    expect(spy).toHaveBeenCalled();
  });

  it('should reset timestamps filters correctly', () => {
    const resetSpy = jest.spyOn(
      component.identityAttributesFiltersForm.get('updateTimestamp')!,
      'reset'
    );

    const startDate = moment(new Date());
    const endDate = moment(new Date());
    component.identityAttributesFiltersForm.patchValue({
      name: 'TestName',
      code: 'TestCode',
      updateTimestamp: { startRange: startDate, endRange: endDate },
    });
    const chipToRemove = { id: 'updateTimestampFrom' } as EuiChip;

    component.removeChip(chipToRemove);

    expect(resetSpy).toHaveBeenCalled();
    expect(component.identityAttributesFiltersForm.value).toEqual({
      name: 'TestName',
      code: 'TestCode',
      updateTimestamp: null,
    });
  });

  it('should populate identityAttributesChips correctly after updating filters', () => {
    component.identityAttributesFiltersForm.patchValue({
      name: 'TestName',
      code: 'TestCode',
      updateTimestamp: {
        startRange: moment(new Date('2025-01-01')),
        endRange: moment(new Date('2025-12-31')),
      },
    });

    component.updateChips();

    expect(component.identityAttributesChips).toEqual([
      { field: 'name', value: 'TestName' },
      { field: 'code', value: 'TestCode' },
      { field: 'updateTimestampFrom', value: '01/01/2025' },
      { field: 'updateTimestampTo', value: '31/12/2025' },
    ]);
  });

    it('should call growlService with success severity on sync success', () => {
        const syncSpy = jest.spyOn(component['_identityAttributesService'], 'synchronizeIdentityAttributes').mockReturnValue(of(null));
        const growlSpy = jest.spyOn(component['growlService'], 'growl');

        component.syncIdentityAttributes();

        expect(syncSpy).toHaveBeenCalled();
        expect(growlSpy).toHaveBeenCalledWith({
            severity: 'success',
            summary: translate('identityAttributesInfoPage.sync.success'),
        });
        expect(appShellService.isBlockDocumentActive).toBe(false);
    });

    it('should call growlService with danger severity on sync error', () => {
        const syncSpy = jest.spyOn(component['_identityAttributesService'], 'synchronizeIdentityAttributes').mockReturnValue(
            new Observable((subscriber) => subscriber.error({}))
        );
        const growlSpy = jest.spyOn(component['growlService'], 'growl');

        component.syncIdentityAttributes();

        expect(syncSpy).toHaveBeenCalled();
        expect(growlSpy).toHaveBeenCalledWith({
            severity: 'danger',
            summary: translate('identityAttributesInfoPage.sync.error'),
        });
        expect(appShellService.isBlockDocumentActive).toBe(false);
    });

    it('should set isBlockDocumentActive to false on sync completion', () => {
        const syncSpy = jest.spyOn(component['_identityAttributesService'], 'synchronizeIdentityAttributes').mockReturnValue(of(null));

        component.syncIdentityAttributes();

        expect(syncSpy).toHaveBeenCalled();
        expect(appShellService.isBlockDocumentActive).toBe(false);
    });
});
