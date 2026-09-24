import {Component, inject, input, OnInit, signal, WritableSignal} from '@angular/core';
import {EUI_PAGE} from "@eui/components/eui-page";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {Router, RouterLink} from "@angular/router";
import {RolesService, UsersService} from "@simpl/api-client-usersroles-tier1-v2";
import {finalize, map, shareReplay, switchMap, tap} from "rxjs";
import {EUI_AUTOCOMPLETE} from "@eui/components/eui-autocomplete";
import {EUI_INPUT_GROUP} from "@eui/components/eui-input-group";
import {EUI_LABEL} from "@eui/components/eui-label";
import {EUI_INPUT_TEXT} from "@eui/components/eui-input-text";
import {EUI_BUTTON} from "@eui/components/eui-button";
import {EuiGrowlService} from "@eui/core";
import {EUI_FEEDBACK_MESSAGE} from "@eui/components/eui-feedback-message";
import {EUI_INPUT_RADIO} from "@eui/components/eui-input-radio";

@Component({
  selector: 'app-edit-user',
  imports: [
    ...EUI_PAGE,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    RouterLink,
    ...EUI_INPUT_TEXT,
    ...EUI_BUTTON,
    ...EUI_INPUT_GROUP,
    ...EUI_LABEL,
    ...EUI_AUTOCOMPLETE,
    ...EUI_FEEDBACK_MESSAGE,
    ...EUI_INPUT_RADIO
  ],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss'
})
export class EditUserComponent implements OnInit{
  router = inject(Router)
  id = input.required<string>();
  userService = inject(UsersService);
  rolesService = inject(RolesService);
  euiGrowlService = inject(EuiGrowlService);
  translateService = inject(TranslateService);
  userForm: FormGroup;
  allRoles: WritableSignal<{id: string, label: string}[]> = signal([]);

  ngOnInit() {

    this.rolesService.searchRoles(null, null, null,null,null,null,null,null, true).pipe(
      shareReplay(),
      map(roles => roles.items),
      map(roles => roles.map(role => ({id: role.code, label: role.name}))),
      tap(roles => this.allRoles.set(roles)),
      switchMap(() => this.userService.getUserById(this.id()).pipe(
        tap(user => {
          const mappedRoles = user.roles.map(role => ({id: role, label: role}))
          this.userForm = new FormGroup({
            email: new FormControl(user.email, [Validators.required, Validators.email]),
            firstName: new FormControl(user.firstName, [Validators.required]),
            lastName: new FormControl(user.lastName, [Validators.required]),
            username: new FormControl(user.username, [Validators.required]),
            enabled: new FormControl(user.enabled, [Validators.required]),
            roles: new FormControl(mappedRoles, [Validators.required])
          })
        })
      )),
    )
    .subscribe()
  }

  saveUser() {
    const userValue = this.userForm.value;
    userValue.roles = userValue.roles.map(role => role.id);
    this.userService.updateUserById(this.id(), userValue).subscribe(
      {
        next: () => {
          this.euiGrowlService.growl({
            severity: 'success',
            summary: this.translateService.instant('common.actionCompleted'),
            detail: this.translateService.instant('editUser.saveSuccess')
          });
          this.router.navigate(['/users'])
        }
      }
    )
  }
}
