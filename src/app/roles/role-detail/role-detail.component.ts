import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolesService } from '../roles.service';
import { ActivatedRoute } from '@angular/router';
import { finalize, forkJoin, switchMap, tap } from 'rxjs';
import { TranslocoDirective } from '@jsverse/transloco';
import { EUI_BUTTON } from '@eui/components/eui-button';
import { EUI_LABEL } from '@eui/components/eui-label';
import { EUI_TABLE_V2, Sort } from '@eui/components/eui-table-v2';
import {
  EUI_PAGINATOR,
  EuiPaginationEvent,
} from '@eui/components/eui-paginator';
import { EUI_PROGRESS_BAR } from '@eui/components/eui-progress-bar';
import { EUI_DIALOG, EuiDialogComponent } from '@eui/components/eui-dialog';
import { EUI_ALERT } from '@eui/components/eui-alert';
import { EUI_PAGE } from '@eui/components/eui-page';
import { EUI_BUTTON_GROUP } from '@eui/components/eui-button-group';
import { EUI_CARD } from '@eui/components/eui-card';
import {
  EUI_DATE_RANGE_SELECTOR,
  EuiDateRangeSelectorDates,
} from '@eui/components/eui-date-range-selector';
import { EUI_INPUT_GROUP } from '@eui/components/eui-input-group';
import { EUI_INPUT_TEXT } from '@eui/components/eui-input-text';
import {
  EuiMaxLengthDirective,
  EuiTooltipDirective,
} from '@eui/components/directives';
import { EUI_CHIP_LIST } from '@eui/components/eui-chip-list';
import { EUI_CHIP, EuiChip } from '@eui/components/eui-chip';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EUI_INPUT_CHECKBOX } from '@eui/components/eui-input-checkbox';
import {
  IdentityAttributeWithOwnership,
} from '@simpl/api-client-authenticationprovider-v1';
import {IdentityAttribute, Role} from '@simpl/api-client-usersroles-tier1-v2';
import { TranslatePipe } from '@ngx-translate/core';
import { startEndDateRangeValidator } from '@fe-simpl/utils';
import {RoleDescriptionPipe} from "@shared/pipes/role-description.pipe";
import {IdentityAttributeResponse} from "@simpl/api-client-authenticationprovider-tier1-v2";

@Component({
  selector: 'app-role-detail',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoDirective,
    RoleDescriptionPipe,
    ReactiveFormsModule,
    TranslatePipe,
    EuiMaxLengthDirective,
    EuiTooltipDirective,
    ...EUI_PAGE,
    ...EUI_INPUT_GROUP,
    ...EUI_LABEL,
    ...EUI_INPUT_TEXT,
    ...EUI_DATE_RANGE_SELECTOR,
    ...EUI_BUTTON_GROUP,
    ...EUI_BUTTON,
    ...EUI_PROGRESS_BAR,
    ...EUI_CARD,
    ...EUI_CHIP_LIST,
    ...EUI_CHIP,
    ...EUI_TABLE_V2,
    ...EUI_INPUT_CHECKBOX,
    ...EUI_PAGINATOR,
    ...EUI_DIALOG,
    ...EUI_ALERT,
  ],
  templateUrl: './role-detail.component.html',
})
export class RoleDetailComponent implements OnInit {
  private readonly service = inject(RolesService);
  private readonly activatedRoute = inject(ActivatedRoute);

  @ViewChild('dialog') confirmDialog: EuiDialogComponent;

  loading = signal(false);
  tableLoading = signal(false);
  roleId: string;
  roleDetail: Role;
  assignedIdentityAttributes: IdentityAttribute[] = []
  attributes: IdentityAttribute[] = [];
  preSelected: Array<IdentityAttributeResponse> = [];

  saveStatus: '' | 'success' | 'error' = '';
  alertTimeout = 6000;

  public pagination: EuiPaginationEvent;
  data: Array<IdentityAttributeResponse> = [];
  totalElements = 0;

  sortingCriteria: Array<string> = [];
  filtersForm: FormGroup;
  roleDetailChips: Array<{ field: string; value: string }> = [];

  constructor() {
    this.roleId = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit() {
    this.filtersForm = new FormGroup({
      name: new FormControl(),
      code: new FormControl(),
      updateTimestamp: new FormControl<EuiDateRangeSelectorDates>(
        {
          value: {
            startRange: null,
            endRange: null,
          },
          disabled: false,
        },
        [startEndDateRangeValidator]
      )

    });

    this.pagination = {
      page: 0,
      pageSize: 5,
      nbPage: 5,
    };

    this.service.getRoleDetail(this.roleId).subscribe();

    this.service.getRoleIdentityAttributes(this.roleId).subscribe();

    this.service.roleDetail$
      .pipe(
        tap((r) => {
          if (r) {
            this.roleDetail = { ...r };
            this.getIdentityAttributeList();
          }
        })
      )
      .subscribe();

    this.service._identityAttributeRoleDetail$
      .pipe(
        tap((r) => {
          if (r) {
            this.assignedIdentityAttributes = [...r];
            this.attributes = [...this.assignedIdentityAttributes];
          }
        })
      )
      .subscribe();
  }

  getIdentityAttributeList() {
    this.tableLoading.set(true);

    const dateFrom = this.filtersForm.get('updateTimestamp')?.value
      ? this.filtersForm
          .get('updateTimestamp')
          ?.value?.startRange?.toISOString()
      : '';
    const dateTo = this.filtersForm.get('updateTimestamp')?.value
      ? this.filtersForm
          .get('updateTimestamp')
          ?.value?.endRange?.clone()
          .add(1, 'days')
          ?.toISOString()
      : '';

    const name = this.filtersForm.get('name')?.value ?? undefined;
    const code = this.filtersForm.get('code')?.value ?? undefined;

    const sort: string[] | undefined = [];
    if (this.sortingCriteria) {
      this.sortingCriteria.forEach((criteria) => {
        sort.push(criteria);
      });
    }

    this.updateChips();

    forkJoin({
      participants: this.service.getIdentityAttributeParticipants(),
      list: this.service.getIdentityAttributeList({
        page: this.pagination.page,
        size: this.pagination.pageSize,
        sort,
        code,
        name,
        assignableToRoles: null,
        enabled: null,
        updateTimestampFrom: dateFrom,
        updateTimestampTo: dateTo,
      }),
    })
      .pipe(finalize(() => this.tableLoading.set(false)))
      .subscribe({
        next: ({ participants, list }) => {
          const participantItems = (participants ?? []) as IdentityAttributeResponse[];
          const listItems = (list.items ?? []);

          const participantIds = new Set<string>(
            participantItems
              .map((p) => p.id)
              .filter((id): id is string => !!id)
          );

          const itemsWithFlag = listItems.map((item) => ({
            ...item,
            assignedToParticipant: item.id ? participantIds.has(item.id) : false,
          }) as IdentityAttributeResponse & { assignedToParticipant: boolean });

          this.data = itemsWithFlag;
          this.totalElements = list.total!;
          this.preSelected = this.getPreSelected();
        },
      });
  }

  updateChips() {
    this.roleDetailChips = Object.keys(this.filtersForm.controls).flatMap(
      (field) => {
        if (field === 'updateTimestamp') {
          const chipsArray = [];
          const dateRange = this.filtersForm.get(field)
            ?.value as EuiDateRangeSelectorDates;
          if (dateRange?.startRange) {
            chipsArray.push({
              field: 'updateTimestampFrom',
              value: dateRange.startRange.format('DD/MM/YYYY'),
            });
          }
          if (dateRange?.endRange) {
            chipsArray.push({
              field: 'updateTimestampTo',
              value: dateRange.endRange.format('DD/MM/YYYY'),
            });
          }
          return chipsArray;
        } else {
          const value = this.filtersForm.get(field)?.value;
          return value ? [{ field, value }] : [];
        }
      }
    );
  }

  removeChip(event: {
    chips: EuiChip[];
    removed: EuiChip | { chip: EuiChip; event: Event };
  }) {
    let filterValue;
    if (String((event.removed as EuiChip).id) === 'updateTimestampFrom') {
      filterValue = this.filtersForm.get('updateTimestamp').value;
      filterValue.startRange = null;
      this.filtersForm.get('updateTimestamp').patchValue(filterValue);
    }
    if (String((event.removed as EuiChip).id) === 'updateTimestampTo') {
      filterValue = this.filtersForm.get('updateTimestamp').value;
      filterValue.endRange = null;
      this.filtersForm.get('updateTimestamp').patchValue(filterValue);
    }
    this.filtersForm.get(String((event.removed as EuiChip).id))?.reset();
    this.filtersForm.updateValueAndValidity();
    this.getIdentityAttributeList();
  }

  onSortChange(newSortCriteria: Array<Sort>) {
    this.sortingCriteria = newSortCriteria.map((sort) => {
      return sort.sort + ',' + sort.order;
    });

    this.getIdentityAttributeList();
  }

  getPreSelected(): Array<IdentityAttributeResponse> {
    const allSelected = (this.attributes ?? []).concat(
      this.assignedIdentityAttributes ?? []
    );
    const preSelected = allSelected
      .filter((attr) => !!attr)
      .flatMap((attributeCode) => {
        const roleFound = this.data?.find(
          (attribute) => attribute.code === attributeCode?.code
        );
        return roleFound || [];
      });

    return preSelected || [];
  }

  confirmSave() {
    this.loading.set(true);
    this.saveStatus = '';
    this.service
      .assignIdentityAttributesToARole(this.roleId, this.attributes)
      .pipe(
        switchMap(() => this.service.getRoleDetail(this.roleId)),
        finalize(() => {
          this.loading.set(false);
          this.confirmDialog.closeDialog();
        })
      )
      .subscribe({
        next: () => {
          this.getIdentityAttributeList();
          this.saveStatus = 'success';

          setTimeout(() => {
            this.saveStatus = '';
          }, this.alertTimeout);
        },
        error: () => {
          this.saveStatus = 'error';

          setTimeout(() => {
            this.saveStatus = '';
          }, this.alertTimeout);
        },
      });
  }

  onResetAttributes() {
    this.attributes = [...this.assignedIdentityAttributes];
  }

  resetFilters() {
    this.filtersForm.patchValue({
      name: null,
      code: null,
      updateTimestamp: {
        startRange: null,
        endRange: null,
      },
    });
    this.filtersForm.updateValueAndValidity();
    this.getIdentityAttributeList();
  }

  onPageChange(e: EuiPaginationEvent): void {
    this.pagination = e;
    this.getIdentityAttributeList();
  }

  getCheck(row: IdentityAttributeWithOwnership): boolean {
    const ind = this.attributes.findIndex((el) => el.code === row.code);
    return ind !== -1;
  }

  toggleCheckedState(event: MouseEvent, row: IdentityAttributeWithOwnership) {
    if ((event?.target as HTMLInputElement)?.checked) {
      this.attributes.push(row);
    } else {
      this.attributes = [...this.attributes.filter((el) => el.code !== row.code)];
    }
  }
}
