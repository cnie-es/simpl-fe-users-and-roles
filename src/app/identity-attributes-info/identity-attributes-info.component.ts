import { Component, inject, OnInit, signal } from '@angular/core';
import {TranslocoDirective, TranslocoService} from '@jsverse/transloco';
import { EUI_TABLE_V2 } from '@eui/components/eui-table-v2';
import {
  EUI_PAGINATOR,
  EuiPaginationEvent,
} from '@eui/components/eui-paginator';
import { EUI_BUTTON } from '@eui/components/eui-button';
import { EUI_LABEL } from '@eui/components/eui-label';
import { EUI_INPUT_TEXT } from '@eui/components/eui-input-text';
import {
  EUI_DATE_RANGE_SELECTOR,
  EuiDateRangeSelectorDates,
} from '@eui/components/eui-date-range-selector';
import { EUI_INPUT_GROUP } from '@eui/components/eui-input-group';
import { EUI_PAGE } from '@eui/components/eui-page';
import { EUI_BUTTON_GROUP } from '@eui/components/eui-button-group';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { EuiMaxLengthDirective } from '@eui/components/directives';
import { EuiChip, EuiChipComponent } from '@eui/components/eui-chip';
import { CommonModule } from '@angular/common';
import {
  IdentityAttributesService,
  IdentityAttributePagedResponse,
  IdentityAttributeResponse,
} from '@simpl/api-client-authenticationprovider-tier1-v2';
import { FilterChipsComponent } from '@fe-simpl/filter-chips';
import { TranslatePipe } from '@ngx-translate/core';
import { ReadableBooleanPipe } from '@fe-simpl/core/pipes';
import {EUI_ICON} from "@eui/components/eui-icon";
import {EuiGrowlService} from "@eui/core";

@Component({
  selector: 'app-identity-attributes-info',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoDirective,
    ReactiveFormsModule,
    FilterChipsComponent,
    TranslatePipe,
    ReadableBooleanPipe,
    EuiMaxLengthDirective,
    ...EUI_PAGE,
    ...EUI_INPUT_GROUP,
    ...EUI_LABEL,
    ...EUI_INPUT_TEXT,
    ...EUI_DATE_RANGE_SELECTOR,
    ...EUI_BUTTON_GROUP,
    ...EUI_BUTTON,
    ...EUI_TABLE_V2,
    ...EUI_PAGINATOR,
    EUI_ICON,
  ],
  templateUrl: './identity-attributes-info.component.html',
})
export class IdentityAttributesInfoComponent implements OnInit {
  private readonly _identityAttributesService = inject(
    IdentityAttributesService
  );

  private readonly growlService = inject(EuiGrowlService);
  private readonly translocoService = inject(TranslocoService);


  loading = signal(false);

  public pagination: EuiPaginationEvent;
  data: Array<IdentityAttributeResponse> = [];
  totalElements = 0;

  // sortingCriteria: Array<string> = [];
  identityAttributesFiltersForm: FormGroup;
  identityAttributesChips: Array<{ field: string; value: string }> = [];

  ngOnInit() {
    this.identityAttributesFiltersForm = new FormGroup({
      name: new FormControl(''),
      code: new FormControl(''),
      updateTimestamp: new FormControl<EuiDateRangeSelectorDates>({
        value: {
          startRange: null,
          endRange: null,
        },
        disabled: false,
      }),
    });

    this.pagination = {
      page: 0,
      pageSize: 5,
      nbPage: 5,
    };

    this.getIdentityAttributeList();
  }

  getIdentityAttributeList() {
    this.loading.set(true);

    const dateFrom = this.identityAttributesFiltersForm.get('updateTimestamp')
      ?.value
      ? this.identityAttributesFiltersForm
          .get('updateTimestamp')
          ?.value?.startRange?.toISOString()
      : '';
    const dateTo = this.identityAttributesFiltersForm.get('updateTimestamp')
      ?.value
      ? this.identityAttributesFiltersForm
          .get('updateTimestamp')
          ?.value?.endRange?.clone()
          .add(1, 'days')
          ?.toISOString()
      : '';

    this.updateChips();

    this._identityAttributesService
      .getDataspaceIdentityAttributes(
        this.pagination.page,
        this.pagination.pageSize,
        [],
        this.identityAttributesFiltersForm.get('code')?.value,
        this.identityAttributesFiltersForm.get('name')?.value,
        undefined,
        undefined,
        dateFrom,
        dateTo
      )
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: IdentityAttributePagedResponse) => {
          this.data = response.items!;
          this.totalElements = response.total!;
        },
      });
  }

  removeChip(
    event:
      | EuiChip
      | EuiChipComponent
      | { chip: EuiChipComponent | EuiChip; event?: Event }
  ) {
    if (
      ['updateTimestampFrom', 'updateTimestampTo'].includes(
        String((event as EuiChip).id)
      )
    ) {
      this.identityAttributesFiltersForm.get('updateTimestamp')?.reset();
    } else {
      this.identityAttributesFiltersForm
        .get(String((event as EuiChip).id))
        ?.reset();
    }
    this.identityAttributesFiltersForm.updateValueAndValidity();
    this.getIdentityAttributeList();
  }

  onPageChange(e: EuiPaginationEvent): void {
    this.pagination = e;
    this.getIdentityAttributeList();
  }

  resetFilters() {
    this.identityAttributesFiltersForm.patchValue({
      name: '',
      code: '',
      updateTimestamp: {
        startRange: null,
        endRange: null,
      },
    });
    this.identityAttributesFiltersForm.updateValueAndValidity();
    this.getIdentityAttributeList();
  }

  updateChips() {
    this.identityAttributesChips = Object.keys(
      this.identityAttributesFiltersForm.controls
    ).flatMap((field) => {
      if (field === 'updateTimestamp') {
        const chipsArray = [];
        const dateRange = this.identityAttributesFiltersForm.get(field)
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
        const value = this.identityAttributesFiltersForm.get(field)?.value;
        return value ? [{ field, value }] : [];
      }
    });
  }

  syncIdentityAttributes() {
    this._identityAttributesService.synchronizeIdentityAttributes().subscribe({
      next: () => {
        this.growlService.growl({
          severity: 'success',
          summary: this.translocoService.translate('identityAttributesInfoPage.sync.success'),
        });
      },
      error: (error) => {
        this.growlService.growl({
          severity: 'danger',
          summary: this.translocoService.translate('identityAttributesInfoPage.sync.error'),
        });
      },
    });
  }
}
