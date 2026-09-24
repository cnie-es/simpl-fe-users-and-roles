import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleListModalComponent } from './role-list-modal.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import en from "../../../../assets/i18n/en.json"

describe('RoleListModalComponent', () => {
  let component: RoleListModalComponent;
  let fixture: ComponentFixture<RoleListModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RoleListModalComponent,
        TranslocoTestingModule.forRoot({
          translocoConfig: {
            availableLangs: ["en"],
            defaultLang: "en",
          },
          langs: {
            en: en
          }
        }),
        NoopAnimationsModule
      ],
      providers: [
        { provide: MAT_DIALOG_DATA,
          useValue: {
            title: 'title',
            cancel: 'cancel',
            noRoles: 'noRoles',
            roles: ['admin'],
          }
        },
        { provide: MatDialogRef, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleListModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
