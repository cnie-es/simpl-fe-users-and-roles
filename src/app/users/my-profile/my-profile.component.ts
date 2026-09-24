import {
  Component,
  inject,
  model,
  ModelSignal,
  OnInit,
  signal,
  ViewChild,
  computed,
  WritableSignal,
  linkedSignal
} from "@angular/core";
import {
  EUI_PAGE,
  EuiPageColumnBodyContentDirective, EuiPageColumnComponent,
  EuiPageColumnsComponent,
  EuiPageContentComponent,
  EuiPageHeaderComponent
} from "@eui/components/eui-page";
import {TranslocoDirective, TranslocoService} from "@jsverse/transloco";
import {EuiButtonComponent} from "@eui/components/eui-button";
import {CommonModule} from "@angular/common";
import {
  CreateRoleRequest,
  Role, RoleRequest,
  RoleRequestsService, RolesService,
  UserRoleRequestPagedResponse, UserSessionService
} from "@simpl/api-client-usersroles-tier1-v2";
import {EuiGrowlService} from "@eui/core";
import {EUI_DIALOG, EuiDialogComponent} from "@eui/components/eui-dialog";
import {EuiAutocompleteComponent, EuiAutoCompleteItem} from "@eui/components/eui-autocomplete";
import {EuiInputGroupComponent} from "@eui/components/eui-input-group";
import {EuiLabelComponent} from "@eui/components/eui-label";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {forkJoin, switchMap} from "rxjs";
import {EUI_CHIP, EuiChip, EuiChipComponent} from "@eui/components/eui-chip";
import {EUI_TABLE_V2, EuiTableV2Component, Sort} from "@eui/components/eui-table-v2";
import {EuiPaginationEvent, EuiPaginatorComponent} from "@eui/components/eui-paginator";
import {EuiTemplateDirective, EuiTooltipDirective} from "@eui/components/directives";
import {EUI_SELECT} from "@eui/components/eui-select";
import {FilterChipsComponent} from "@fe-simpl/filter-chips";
import {EUI_BUTTON_GROUP} from "@eui/components/eui-button-group";
import {EuiIconSvgComponent} from "@eui/components/eui-icon";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoDirective,
    TranslatePipe,
    EuiPageHeaderComponent,
    EuiPageColumnsComponent,
    EuiPageContentComponent,
    EuiPageColumnBodyContentDirective,
    EuiPageColumnComponent,
    EuiButtonComponent,
    EuiDialogComponent,
    ...EUI_PAGE,
    ...EUI_DIALOG,
    EuiAutocompleteComponent,
    EuiInputGroupComponent,
    EuiLabelComponent,
    FormsModule,
    ...EUI_CHIP,
    EuiTableV2Component,
    EuiPaginatorComponent,
    EuiTemplateDirective,
    ...EUI_TABLE_V2,
    ReactiveFormsModule,
    ...EUI_SELECT,
    FilterChipsComponent,
    ...EUI_BUTTON_GROUP,
    EuiIconSvgComponent,
    EuiTooltipDirective
  ]
})
export class MyProfileComponent implements OnInit {

  private readonly roleRequestsService = inject(RoleRequestsService)
  private readonly userSessionService = inject(UserSessionService);
  private readonly rolesService = inject(RolesService);
  private readonly translocoService = inject(TranslocoService);
  private readonly euiGrowlService = inject(EuiGrowlService);

  $loading = signal(false);

  @ViewChild('dialog') dialog: EuiDialogComponent;
  @ViewChild('dialogDetail') dialogDetail: EuiDialogComponent;
  @ViewChild('dialogDeleteRoleRequest') dialogDeleteRoleRequest: EuiDialogComponent;

  rolesAssigned: string[] = [];
  roles: Role[];
  userRoleRequest: UserRoleRequestPagedResponse;
  roleRequestToDelete: RoleRequest;
  selectableRoles: EuiAutoCompleteItem[] = [];
  roleRequestDetail: RoleRequest;
  rolesSelected: ModelSignal<undefined | { euiInternalId: string, id: string, label: string }[]> = model<{
    euiInternalId: string,
    id: string,
    label: string
  }[]>();
  public readonly pagination: WritableSignal<EuiPaginationEvent> = signal({
    page: 0,
    pageSize: 5,
    nbPage: 5,
  });
  sortCriteria: WritableSignal<Sort[]> = signal([]);

  roleRequestsFiltersForm: FormGroup<{
    status: FormControl<'OPEN' | 'CANCELED' | 'APPROVED' | 'REJECTED' | null>;
  }>;

  credentialsChips = signal<
    Array<{
      field: Partial<keyof UserRoleRequestPagedResponse>;
      value: string;
    }>
  >([]);

  filtersData = signal<Partial<{
    status: 'OPEN' | 'CANCELED' | 'APPROVED' | 'REJECTED';
  }> | null>(null);

  roleRequests = linkedSignal(() => {
    return this.roleRequestsService.searchEndUsersRoleRequests(
      this.pagination().page,
      this.pagination().pageSize,
      this.sortCriteria().map(
        (sortItem) => `${sortItem.order === 'desc' ? '-' : ''}${sortItem.sort}`
      ),
      this.filtersData()?.status ?? null
    ).pipe();
  });

  private updateSelectableRoles(rolesList: { items?: Role[] }): void {
    const assignedRoleNames = new Set(this.rolesAssigned ?? []);

    const openRequestedRoleNames = new Set(
      (this.userRoleRequest?.items ?? [])
        .flatMap((request: RoleRequest) => request.rolesRequested ?? [])
    );

    const excludedRoleNames = new Set<string>([...assignedRoleNames, ...openRequestedRoleNames]);

    this.roles = (rolesList.items ?? []).filter((role: Role) => {
      return !excludedRoleNames.has(role.name);
    });

    this.selectableRoles = this.roles.map((role) => {
      return {
        id: role.code,
        label: role.description ? `${role.name} - ${role.description}` : role.name,
        };
    });
  }

  ngOnInit() {

    this.$loading.set(true);

    this.roleRequestsFiltersForm = new FormGroup({
      status: new FormControl()
    })

    forkJoin({
      userRoleRequest: this.roleRequestsService.searchEndUsersRoleRequests(),
      userSession: this.userSessionService.getUserSessionData(),
      rolesList: this.rolesService.searchRoles(null, null, null, null, null, null, true, null, true)
    }).subscribe({
      next: ({userRoleRequest, userSession, rolesList}) => {
        this.userRoleRequest = userRoleRequest;
        this.rolesAssigned = userSession.roles;

        this.updateSelectableRoles(rolesList);
      },
      complete: () => {
        this.$loading.set(false);
      }
    });
  }

  protected onSubmitRoleRequests() {
    const createRoleRequest = computed<CreateRoleRequest>(() => ({
      rolesRequested: this.rolesSelected()?.map(role => role.id) ?? []
    }));

    this.roleRequestsService
      .createNewRoleRequest(createRoleRequest())
      .pipe(
        switchMap(() =>
          forkJoin({
            userRoleRequest: this.roleRequestsService.searchEndUsersRoleRequests(),
            rolesList: this.rolesService.searchRoles(null, null, null, null, null, null, true, null, true)
          })
        ),
      )
      .subscribe({
        next: ({userRoleRequest, rolesList}) => {
          this.pagination.set({page: 0, pageSize: 5, nbPage: 5});
          this.userRoleRequest = userRoleRequest;
          this.updateSelectableRoles(rolesList);
          this.euiGrowlService.growl({
            severity: 'success',
            summary: this.translocoService.translate('roleRequests.saveSuccess'),
          });
        },
        error: (err) => {
          if (err.status === 422) {
            this.euiGrowlService.growl({
              severity: 'danger',
              summary: this.translocoService.translate('roleRequests.alreadyRequested'),
            });
          } else {
            this.euiGrowlService.growl({
              severity: 'danger',
              summary: this.translocoService.translate('roleRequests.errorSave'),
            });
          }
        }
      });
  }

  onPageChange(e: EuiPaginationEvent): void {
    this.pagination.set(e);
  }

  onSortChange($event: Sort[]) {

  }

  resetCredentialsFilters() {
    this.roleRequestsFiltersForm.reset({
      status: undefined
    });
    this.credentialsChips.set([]);
    this.filtersData.set(null);
  }

  onChipRemove(
    $event:
      | EuiChip
      | EuiChipComponent
      | { chip: EuiChipComponent | EuiChip; event?: Event }
  ) {
    this.removeCredentialChip(String(($event as EuiChip).id));
  }

  private removeCredentialChip(key: string) {
    this.credentialsChips.update((actualChips) => {
      return actualChips.filter((chip) => chip.field !== key);
    });
    this.roleRequestsFiltersForm.get(key).reset(null);
    this.filtersData.set(this.roleRequestsFiltersForm.value);
    this.pagination.update(pagination => {
      return {
        page: 0,
        pageSize: pagination.pageSize,
        nbPage: 5,
      };
    });
  }

  addFilter() {
    const filters = this.roleRequestsFiltersForm.value;
    this.filtersData.set(filters);
    this.pagination.update(pagination => {
      return {
        page: 0,
        pageSize: pagination.pageSize,
        nbPage: 5,
      };
    });
    Object.entries(filters).forEach(
      ([key, value]: [
        string, 'OPEN' | 'CANCELED' | 'APPROVED' | 'REJECTED' | null
      ]) => {
        if (!value) {
          this.removeCredentialChip(key);
          return;
        }

        if (typeof value === 'string') {
          this.addCredentialChip(key, `${value}`);
          return;
        }

        this.removeCredentialChip(key);
      }
    );
  }

  private addCredentialChip(key: string, chipText: string) {
    const found = this.credentialsChips().find((chip) => chip.field === key);
    if (found) {
      found.value = chipText;
    } else {
      const chip = {
        field: key as keyof UserRoleRequestPagedResponse,
        value: chipText,
      };
      this.credentialsChips.update((actualChips) => {
        return [...actualChips, chip];
      });
    }
  }

  protected resetRolesSelected() {
    this.rolesSelected.set(null)
    if (this.dialog) {
      this.dialog.disableAcceptButton();
    }
  }

  protected showRoleRequestDetail(row: RoleRequest) {
    this.roleRequestsService.getRoleRequestById(row.id).subscribe(roleRequest => {
      this.roleRequestDetail = roleRequest;
      this.dialogDetail.openDialog();
    })
  }

  protected openDialog() {
    if (this.dialog) {
      this.dialog.openDialog();
      this.dialog.disableAcceptButton();
    }
  }

  protected onRolesSelectedChange(value: { euiInternalId: string; id: string; label: string }[] | null): void {
    const hasSelection = !!value && value.length > 0;
    if (this.dialog) {
      if (hasSelection) {
        this.dialog.enableAcceptButton();
      } else {
        this.dialog.disableAcceptButton();
      }
    }
  }

  deleteRoleRequest(row: any) {
    this.roleRequestToDelete = row;
    this.dialogDeleteRoleRequest.openDialog();
  }

  protected onDeleteRoleRequest() {
    this.roleRequestsService.cancelRoleRequestById(this.roleRequestToDelete.id).subscribe({
      next: () => {
        this.euiGrowlService.growl({
          severity: 'success',
          summary: this.translocoService.translate('roleRequests.deleteSuccess'),
        });
        this.pagination.set({page: 0, pageSize: 5, nbPage: 5});
      },
      error: (err) => {
        this.euiGrowlService.growl({
          severity: 'danger',
          summary: this.translocoService.translate('roleRequests.deleteError'),
        })
      }
    })
  }
}
