import {Injectable, signal, WritableSignal} from '@angular/core';
import {EuiChip} from "@eui/components/eui-chip";
import {EuiPaginationEvent} from "@eui/components/eui-paginator";
import {Sort} from "@eui/components/eui-table-v2";
import {CreateRoleRequestResponse, RoleRequestPagedResponse} from "@simpl/api-client-usersroles-tier1-v2";
import {FormControl, FormGroup} from "@angular/forms";
import StatusEnum = CreateRoleRequestResponse.StatusEnum;

const INITIAL_PAGINATION_VALUE = {
  page: 0,
  pageSize: 5,
  nbPage: 5,
}

@Injectable({
  providedIn: 'root'
})
export class RoleRequestsManagementService {

  roleRequestsFilterForm = new FormGroup({
    createdBy: new FormControl<string>(null),
    status: new FormControl<StatusEnum>(null),
  });

  filtersChips: WritableSignal<EuiChip[]> = signal([]);

  pagination: WritableSignal<EuiPaginationEvent> = signal(INITIAL_PAGINATION_VALUE);

  public readonly dataSorting: WritableSignal<Sort[]> = signal([]);
  public readonly roleRequestsData: WritableSignal<RoleRequestPagedResponse | null> =
    signal(null);

  constructor() { }
}
