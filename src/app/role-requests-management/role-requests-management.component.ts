import {AfterViewInit, Component, inject, OnInit, signal, viewChild, WritableSignal} from '@angular/core';
import {EUI_PAGE} from "@eui/components/eui-page";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {EUI_INPUT_GROUP} from "@eui/components/eui-input-group";
import {EUI_LABEL} from "@eui/components/eui-label";
import {EuiMaxLengthDirective, EuiTooltipDirective} from "@eui/components/directives";
import {EUI_INPUT_TEXT} from "@eui/components/eui-input-text";
import {EUI_BUTTON_GROUP} from "@eui/components/eui-button-group";
import {EUI_BUTTON} from "@eui/components/eui-button";
import {EUI_TABLE_V2, Sort} from "@eui/components/eui-table-v2";
import {EuiDateRangeSelectorDates} from "@eui/components/eui-date-range-selector";
import {RoleRequest, RoleRequestsService} from "@simpl/api-client-usersroles-tier1-v2";
import {EUI_PAGINATOR, EuiPaginationEvent, EuiPaginatorComponent} from "@eui/components/eui-paginator";
import {tap} from "rxjs";
import {EUI_CHIP, EuiChip, EuiChipComponent} from "@eui/components/eui-chip";
import {SlicePipe} from "@angular/common";
import {I18nDatePipe} from "@shared/pipes";
import {EUI_SELECT} from "@eui/components/eui-select";
import {EUI_ICON} from "@eui/components/eui-icon";
import {EUI_DIALOG, EuiDialogComponent} from "@eui/components/eui-dialog";
import {Router} from "@angular/router";
import {RoleRequestDetailComponent} from "./role-request-detail/role-request-detail.component";
import {RoleRequestsManagementService} from "./role-requests-management.service";
import {ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-role-requests-management',
  imports: [
    TranslatePipe,
    EuiMaxLengthDirective,
    SlicePipe,
    I18nDatePipe,
    EuiTooltipDirective,
    ...EUI_PAGE,
    ...EUI_INPUT_GROUP,
    ...EUI_LABEL,
    ...EUI_INPUT_TEXT,
    ...EUI_BUTTON_GROUP,
    ...EUI_BUTTON,
    ...EUI_TABLE_V2,
    ...EUI_PAGINATOR,
    ...EUI_CHIP,
    ...EUI_SELECT,
    ...EUI_ICON,
    ...EUI_DIALOG,
    RoleRequestDetailComponent,
    ReactiveFormsModule
  ],
  templateUrl: './role-requests-management.component.html'
})

export class RoleRequestsManagementComponent implements OnInit, AfterViewInit {
  roleRequestsService = inject(RoleRequestsService);
  roleRequestsManagementService = inject(RoleRequestsManagementService);
  translateService = inject(TranslateService);
  router = inject(Router);


  public readonly roleRequestDetail: WritableSignal<RoleRequest | null> =
    signal(null);

  roleRequestDetailDialog = viewChild<EuiDialogComponent>('roleRequestDetailDialog');
  paginator = viewChild<EuiPaginatorComponent>('paginator');

  ngOnInit() {
    this.getRoleRequestsList().subscribe()
  }

  ngAfterViewInit() {
    this.paginator().getPage(this.roleRequestsManagementService.pagination().page, {emitEvent: false})
  }

  getRoleRequestsList() {

    const sort: string[] = this.roleRequestsManagementService.dataSorting().map((sortCriteria) => {
      if (sortCriteria.order === 'asc') return sortCriteria.sort;
      return `-${sortCriteria.sort}`;
    });

    return this.roleRequestsService
      .searchRoleRequests(
        this.roleRequestsManagementService.pagination().page,
        this.roleRequestsManagementService.pagination().pageSize,
        sort,
        this.roleRequestsManagementService.roleRequestsFilterForm.get('createdBy').value ?? undefined,
        this.roleRequestsManagementService.roleRequestsFilterForm.get('status').value ?? undefined,
      )
      .pipe(
        tap((result) => {
          this.roleRequestsManagementService.roleRequestsData.set(result);
        })
      );
  }

  resetFilters() {
    this.roleRequestsManagementService.roleRequestsFilterForm.reset();
    this.roleRequestsManagementService.roleRequestsFilterForm.updateValueAndValidity();
    this.roleRequestsManagementService.filtersChips.set([]);
    this.resetPagination();
    this.getRoleRequestsList().subscribe();
  }

  removeChip( event:
                | EuiChip
                | EuiChipComponent
                | { chip: EuiChipComponent | EuiChip; event?: Event }) {
    const id = (event as EuiChip).id as string;
    this.roleRequestsManagementService.filtersChips.update( chips => {
      this.roleRequestsManagementService.roleRequestsFilterForm.get(id).reset(null);
      return chips.filter(
        (chip) => chip.id !== id
      );

    })
  }

  onSortChange($event: Sort[]) {
    this.roleRequestsManagementService.dataSorting.set($event);
    this.getRoleRequestsList().subscribe();
  }

  onPageChange($event: EuiPaginationEvent) {
    this.roleRequestsManagementService.pagination.set($event);
    this.getRoleRequestsList().subscribe();
  }

  addFilter() {
    const filters = this.roleRequestsManagementService.roleRequestsFilterForm.value;
    Object.entries(filters).forEach(
      ([key, value]: [string, string | EuiDateRangeSelectorDates]) => {
        if (!value) {
          this.removeChip({id: key} as EuiChip);
          return;
        }

        if (typeof value === 'string' && value !== '') {
          const translatedFilterKey = this.translateService.instant(
            `roleRequestsManagement.filters.${key}`
          );
          this.addChip(key, `${translatedFilterKey}:${value}`);
          return;
        }

        this.removeChip({id: key} as EuiChip);
      }
    );
    this.resetPagination();
    this.getRoleRequestsList().subscribe();
  }

  addChip(key: string, label: string): void {
    const found = this.roleRequestsManagementService.filtersChips().find((chip) => chip.id === key);
    if (found) {
      found.label = label;
    } else {
      const chip = new EuiChip({
        id: key,
        label: label,
        typeClass: 'primary',
        isDeletable: true,
      });
      this.roleRequestsManagementService.filtersChips.update(chips => [...chips, chip]);
    }
  }

  resetPagination() {
     this.roleRequestsManagementService.pagination.update( actualPagination => ({...actualPagination, page: 0}));
   }

  showRoleRequestDetail(row: RoleRequest) {
    this.roleRequestsService.getRoleRequestById(row.id).pipe(
      tap(roleRequest => this.roleRequestDetail.set(roleRequest)),
      tap((roleRequest) => this.roleRequestDetailDialog().hasAcceptButton = roleRequest.status === 'OPEN'),
      tap(() => this.roleRequestDetailDialog().openDialog())
    ).subscribe()
  }

  reviewRoleRequest(row: RoleRequest) {
    this.roleRequestDetailDialog().closeDialog();
    this.router.navigate(['/role-requests-management/review', row.id]);
  }

  onRoleRequestDetailDialogClose() {
    this.roleRequestDetail.set(null);
  }
}
