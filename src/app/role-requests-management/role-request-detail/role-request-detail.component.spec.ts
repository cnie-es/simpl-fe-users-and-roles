import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RoleRequestDetailComponent} from './role-request-detail.component';
import {ComponentRef} from "@angular/core";
import {TranslateModule} from "@ngx-translate/core";

describe('DialogRoleRequestDetailComponent', () => {
  let component: RoleRequestDetailComponent;
  let fixture: ComponentFixture<RoleRequestDetailComponent>;
  let componentRef: ComponentRef<RoleRequestDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleRequestDetailComponent, TranslateModule.forRoot()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleRequestDetailComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('data', {
      "id": "test-id",
      "createdBy": "mock@email.com",
      "status": "CANCELED",
      "rolesRequested": [
        "ROLE_1",
        "ROLE_2",
        "ROLE_3",
        "ROLE_4",
      ],
      "rolesAssigned": [],
      "creationTimestamp": "2026-01-15T11:40:16.522505Z",
      "lastUpdateTimestamp": "2026-01-15T15:18:10.994035Z"
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
