import {Component, computed, inject, input, OnInit, signal} from '@angular/core';
import {RoleRequestDetailComponent} from "../role-request-detail/role-request-detail.component";
import {
  Role,
  RoleRequest,
  RoleRequestsService,
  RolesService,
  UsersService
} from "@simpl/api-client-usersroles-tier1-v2";
import {EuiGrowlService} from "@eui/core";
import {map, switchMap, tap} from "rxjs";
import {EUI_PAGE} from "@eui/components/eui-page";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {EuiAutocompleteComponent, EuiAutoCompleteItem} from "@eui/components/eui-autocomplete";
import {EuiInputGroupComponent} from "@eui/components/eui-input-group";
import {EuiLabelComponent} from "@eui/components/eui-label";
import {ReactiveFormsModule} from "@angular/forms";
import {EUI_BUTTON} from "@eui/components/eui-button";
import {EUI_ICON} from "@eui/components/eui-icon";
import {Router, RouterLink} from "@angular/router";
import StatusEnum = RoleRequest.StatusEnum;

@Component({
  selector: 'app-role-request-review',
  imports: [
    RoleRequestDetailComponent,
    TranslatePipe,
    EuiAutocompleteComponent,
    EuiInputGroupComponent,
    EuiLabelComponent,
    ReactiveFormsModule,
    ...EUI_PAGE,
    ...EUI_BUTTON,
    ...EUI_ICON,
    RouterLink
  ],
  templateUrl: './role-request-review.component.html'
})
export class RoleRequestReviewComponent implements OnInit{
  id = input.required<string>();
  roleRequestsService = inject(RoleRequestsService);
  rolesService = inject(RolesService);
  growlService = inject(EuiGrowlService);
  router = inject(Router);
  translateService = inject(TranslateService);
  usersService = inject(UsersService);
  roleRequest = signal<RoleRequest | null>(null);
  roleAlreadyAssigned = signal<Array<string>>([]);
  allRoles = signal<Role[]>([]);
  availableRoles = signal<Role[]>([]);
  availableRolesAutocomplete = computed<EuiAutoCompleteItem[]>(() => this.availableRoles().map(role => ({id: role.code, label: role.name})));
  selectedRoles = signal<EuiAutoCompleteItem[]>([])

  ngOnInit() {
    this.roleRequestsService.getRoleRequestById(this.id()).pipe(
      tap(roleRequest => this.roleRequest.set(roleRequest)),
      tap(roleRequest => this.selectedRoles.set(roleRequest.rolesRequested.map(role => ({id: role, label: role})))),
      switchMap((roleRequest) => this.usersService.searchUsers(null, null, null, null, null, roleRequest.createdBy)),
      tap((usersResponse: any) => {
        const user = usersResponse?.items?.[0];
        this.roleAlreadyAssigned.set((user?.roles ?? []) as string[]);
      }),
      switchMap(() => this.rolesService.searchRoles(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true)),
      map((roles: any) => roles.items ?? roles),
      tap(roles => this.allRoles.set(roles)),
      tap((roles) => this.setAvailableRoles(roles, this.roleRequest()?.rolesRequested ?? [])),
    ).subscribe();
  }

  submitRoleRequestReview(outcome: StatusEnum){
    let rolesToAssign = [];
    if (outcome === 'APPROVED') {
      rolesToAssign = this.selectedRoles().map(role => role.id);
    }

    this.roleRequestsService.putRoleRequestById(this.roleRequest().id, {status: outcome, rolesAssigned: rolesToAssign}).pipe().subscribe({
      error: () => {
        this.growlService.growlError(this.translateService.instant('common.failureMessage'));
      },
      complete: () => {
        this.growlService.growlSuccess(this.translateService.instant('roleRequestsManagement.review.successMessage'));
        this.router.navigate(['/role-requests-management']);
      }
    })
  }

  private setAvailableRoles(allRoles: Role[], roleRequestRoles: string[]) {
    const requestedOrSelected = new Set<string>([...(roleRequestRoles ?? []), ...(this.roleAlreadyAssigned() ?? [])]);
    const calculateAvailableRoles = (roles: Role[]) => {
      return (roles ?? []).filter(role => !requestedOrSelected.has(role.name));
    }
    this.availableRoles.set(calculateAvailableRoles(allRoles));
  }

  protected onRoleSelected($event: EuiAutoCompleteItem[]) {
    this.selectedRoles.set($event);
    this.setAvailableRoles(this.allRoles(), $event.map(role => role.id as string));
  }
}
