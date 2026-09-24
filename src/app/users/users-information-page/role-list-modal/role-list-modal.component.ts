import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { RoleDescriptionPipe } from "@shared/pipes/role-description.pipe";
import {Role} from "@simpl/api-client-usersroles-tier1-v2";

export interface UserRolesDialogData {
  title: string,
  cancel: string,
  noRoles: string,
  roles: Role[]
}

@Component({
  selector: 'app-role-list-modal',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoDirective,
    RoleDescriptionPipe
  ],
  templateUrl: './role-list-modal.component.html',
})
export class RoleListModalComponent  {
  @Input() data: UserRolesDialogData = {
    title: '',
    cancel: '',
    noRoles: '',
    roles: []
  };
}
