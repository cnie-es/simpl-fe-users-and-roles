import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [I18nService],
    });
    service = TestBed.inject(I18nService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getTranslation', () => {
    it('should fetch translation for the given language', () => {
      const testLang = 'en';
      const mockTranslation = { key: 'value' };

      service.getTranslation(testLang).subscribe((translation) => {
        expect(translation).toEqual(mockTranslation);
      });

      const req = httpMock.expectOne(
        (request) =>
          request.url.includes(`assets/i18n/${testLang}.json`) &&
          request.urlWithParams.includes(`v=`)
      );

      expect(req.request.method).toBe('GET');
      req.flush(mockTranslation);
    });
  });
});
