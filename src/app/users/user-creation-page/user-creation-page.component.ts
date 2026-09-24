import { CommonModule } from '@angular/common';
import { Component, inject, NgZone, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { UsersService } from '../users.service';
import { EUI_INPUT_GROUP } from '@eui/components/eui-input-group';
import { EUI_INPUT_TEXT } from '@eui/components/eui-input-text';
import { EUI_PROGRESS_BAR } from '@eui/components/eui-progress-bar';
import { EUI_LABEL } from '@eui/components/eui-label';
import { EUI_ICON } from '@eui/components/eui-icon';
import { EUI_FEEDBACK_MESSAGE } from '@eui/components/eui-feedback-message';
import { EUI_BUTTON } from '@eui/components/eui-button';
import {
  EUI_AUTOCOMPLETE,
  EuiAutoCompleteItem,
} from '@eui/components/eui-autocomplete';
import { EUI_PAGE } from '@eui/components/eui-page';
import { Role } from '@simpl/api-client-usersroles-tier1-v2';
import { EuiGrowlService } from '@eui/core';
import {
  confirmPasswordValidator,
  createPasswordValidator,
} from '@fe-simpl/utils';
import { EuiMaxLengthDirective } from '@eui/components/directives';
import { TranslatePipe } from '@ngx-translate/core';
import { passwordMaxLength, passwordMinLength } from '@shared/utils/forms/validators';

const PASSWORD_VALIDATION_CONFIG = {
  minLength: passwordMinLength,
  maxLength: passwordMaxLength,
  minSubstringLength: 5,
  forbiddenFields: ['email', 'lastName', 'firstName', 'username'],
};

@Component({
  selector: 'app-user-creation-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoDirective,
    TranslatePipe,
    EuiMaxLengthDirective,
    ...EUI_PAGE,
    ...EUI_PROGRESS_BAR,
    ...EUI_INPUT_GROUP,
    ...EUI_LABEL,
    ...EUI_FEEDBACK_MESSAGE,
    ...EUI_INPUT_TEXT,
    ...EUI_BUTTON,
    ...EUI_ICON,
    ...EUI_AUTOCOMPLETE,
  ],
  templateUrl: './user-creation-page.component.html',
})
export class UserCreationPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly service = inject(UsersService);
  private readonly translocoService = inject(TranslocoService);
  private readonly route = inject(ActivatedRoute);
  private readonly euiGrowlService = inject(EuiGrowlService);

  public readonly passwordValidationConfig = PASSWORD_VALIDATION_CONFIG;
  public readonly specialCharsSample = '!%&#*;';

  userForm: FormGroup;
  loading = false;
  roles: Role[];
  selectableRoles: EuiAutoCompleteItem[] = [];
  passwordVisible = false;
  passwordConfirmVisible = false;
  private readonly ngZone = inject(NgZone);

  ngOnInit(): void {
    this.userForm = new FormGroup(
      {
        email: new FormControl('', [
          Validators.required,
          Validators.email,
          Validators.pattern('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$'),
        ]),
        firstName: new FormControl('', [Validators.required]),
        lastName: new FormControl('', [Validators.required]),
        username: new FormControl('', [Validators.required]),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(PASSWORD_VALIDATION_CONFIG.minLength),
          Validators.maxLength(PASSWORD_VALIDATION_CONFIG.maxLength),
        ]),
        enabled: new FormControl(true),
        confirmPassword: new FormControl('', [Validators.required]),
        roles: new FormControl([], [Validators.required]),
      },
      {
        validators: [
          createPasswordValidator(PASSWORD_VALIDATION_CONFIG),
          confirmPasswordValidator,
        ],
      }
    );

    this.service.getAllRoles().subscribe((res) => {
      this.roles = res;
      this.selectableRoles = this.roles.map((role) => {
        return {
          id: role.name,
          label: role.name,
        };
      });
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.loading = true;

      const newUser = this.userForm.getRawValue();
      const selectedRoles = this.userForm.get('roles')?.value ?? [];

      newUser.roles = selectedRoles.map((role: EuiAutoCompleteItem) => role.id);

      this.service.createUser(newUser).subscribe({
        next: () => {
          this.loading = false;
          this.euiGrowlService.growl({
            severity: 'success',
            summary: this.translocoService.translate('newUser.saveSuccess'),
          });
          this.ngZone.run(() => {
            this.router.navigate(['/users'], { relativeTo: this.route });
          });
        },
        error: () => {
          this.loading = false;
        },
      });
    }
  }
}
