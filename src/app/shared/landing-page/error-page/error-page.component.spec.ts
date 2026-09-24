import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorPageComponent } from './error-page.component';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KeycloakService } from 'keycloak-angular';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import en from "../../../../assets/i18n/en.json"

describe('ErrorPageComponent', () => {
  let component: ErrorPageComponent;
  let fixture: ComponentFixture<ErrorPageComponent>;
  let mockRouter: Partial<Router>;

  beforeEach(async () => {
    mockRouter = {
      getCurrentNavigation: jest.fn().mockReturnValue({
        extras: {
          state: {
            error: new HttpErrorResponse({
              status: 404,
              statusText: 'Not Found',
              url: 'https://url.com/api/test',
              error: { message: 'Test not found' }
            })
          }
        }
      })
    };

    await TestBed.configureTestingModule({
      imports: [
        ErrorPageComponent,
        TranslocoTestingModule.forRoot({
          translocoConfig: {
            availableLangs: ["en"],
            defaultLang: "en",
          },
          langs: { en: en }
        }),
        NoopAnimationsModule
      ],
      providers: [
        KeycloakService,
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set errorData', () => {
    expect(component.errorData).toBeTruthy();
    expect(component.errorData?.status).toBe(404);
    expect(component.errorData?.statusText).toBe('Not Found');
    expect(component.errorData?.url).toBe('https://url.com/api/test');
    expect(component.errorData?.error?.message).toBe('Test not found');
  });

  it('should have errorData undefined if there isn\'t any error state', () => {
    (mockRouter.getCurrentNavigation as jest.Mock).mockReturnValueOnce({
      extras: {}
    });

    const fixture = TestBed.createComponent(ErrorPageComponent);
    component = fixture.componentInstance;

    expect(component.errorData).toBeUndefined();
  });
});
