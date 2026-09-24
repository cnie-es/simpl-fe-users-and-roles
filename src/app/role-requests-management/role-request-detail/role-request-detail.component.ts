import {Component, input, InputSignal} from '@angular/core';
import {RoleRequest} from "@simpl/api-client-usersroles-tier1-v2";
import {TranslatePipe} from "@ngx-translate/core";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-role-request-detail',
  imports: [
    TranslatePipe,
    DatePipe
  ],
  templateUrl: './role-request-detail.component.html',
})
export class RoleRequestDetailComponent {
  data: InputSignal<RoleRequest> = input.required();
  roleAlreadyAssigned: InputSignal<Array<string>> = input();
}
