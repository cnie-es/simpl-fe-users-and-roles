import {Component, inject, input, OnInit, signal} from "@angular/core";
import {CommonModule} from "@angular/common";
import {EUI_BUTTON} from "@eui/components/eui-button";
import {EUI_BUTTON_GROUP} from "@eui/components/eui-button-group";
import {EUI_INPUT_GROUP} from "@eui/components/eui-input-group";
import {EUI_INPUT_TEXT} from "@eui/components/eui-input-text";
import {EUI_LABEL} from "@eui/components/eui-label";
import {EuiMaxLengthDirective, EuiTemplateDirective, EuiTooltipDirective} from "@eui/components/directives";
import {
  EUI_PAGE,
} from "@eui/components/eui-page";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {TranslocoDirective, TranslocoService} from "@jsverse/transloco";
import {EUI_TEXTAREA} from "@eui/components/eui-textarea";
import {Router} from "@angular/router";
import {IdentityAttribute, Role} from "@simpl/api-client-usersroles-tier1-v2";
import {RolesService} from "../roles.service";
import {EuiGrowlService} from "@eui/core";
import {EuiInputCheckboxComponent} from "@eui/components/eui-input-checkbox";
import {EuiPaginationEvent, EuiPaginatorComponent} from "@eui/components/eui-paginator";
import {EuiTableV2Component, EuiTableV2SortableColComponent, Sort} from "@eui/components/eui-table-v2";
import {
  IdentityAttributeWithOwnership,
} from "@simpl/api-client-authenticationprovider-v1";
import {finalize, switchMap, tap, filter, forkJoin} from "rxjs";
import {EuiDateRangeSelectorComponent, EuiDateRangeSelectorDates} from "@eui/components/eui-date-range-selector";
import {startEndDateRangeValidator} from "@shared/utils";
import {EuiChip, EuiChipComponent} from "@eui/components/eui-chip";
import {EuiChipListComponent} from "@eui/components/eui-chip-list";
import {
  IdentityAttributeResponse
} from "@simpl/api-client-authenticationprovider-tier1-v2";
import {EUI_SLIDE_TOGGLE} from "@eui/components/eui-slide-toggle";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoDirective,
    ReactiveFormsModule,
    TranslatePipe,
    EuiMaxLengthDirective,
    ...EUI_PAGE,
    ...EUI_INPUT_GROUP,
    ...EUI_LABEL,
    ...EUI_INPUT_TEXT,
    ...EUI_BUTTON_GROUP,
    ...EUI_BUTTON,
    ...EUI_TEXTAREA,
    EuiInputCheckboxComponent,
    EuiPaginatorComponent,
    EuiTableV2Component,
    EuiTableV2SortableColComponent,
    EuiTemplateDirective,
    EuiTooltipDirective,
    EuiChipComponent,
    EuiChipListComponent,
    EuiDateRangeSelectorComponent,
    ...EUI_SLIDE_TOGGLE
  ]
})
export class RoleComponent implements OnInit {
  role: FormGroup;
  filtersSearch: FormGroup;
  mode: 'new' | 'edit' = 'new';
  id = input<string>()
  data: Array<IdentityAttributeResponse> = [];
  preSelected: Array<IdentityAttributeResponse> = [];
  public paginator: EuiPaginationEvent;
  loading = signal(false);
  sortingCriteria: Array<string> = [];
  roleChips: Array<{ field: string; value: string }> = [];
  totalElems = 0;
  assignedIdentityAttributes: IdentityAttribute[] = []
  identityAttributes: IdentityAttribute[] = [];
  private readonly service = inject(RolesService);
  private readonly euiGrowlService = inject(EuiGrowlService);
  private readonly translocoService = inject(TranslocoService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.filtersSearch = new FormGroup({
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

    this.paginator = {
      page: 0,
      pageSize: 5,
      nbPage: 5,
    };

    this.role = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      code: new FormControl(null, [Validators.required]),
      builtIn: new FormControl(null),
      description: new FormControl(null, [Validators.required]),
      enabled: new FormControl(true),
    });

    if (this.id()) {
      this.mode = 'edit';

      this.service.getRoleDetail(this.id()).subscribe();

      this.service.roleDetail$.pipe(
        filter((role) => !!role),
        tap((role) => {
        this.role.patchValue({
          name: role.name,
          code: role.code,
          builtIn: role.builtIn,
          description: role.description,
          enabled: role.enabled,
        });

        this.role.get('name')?.disable();
        this.role.get('code')?.disable();
      })).subscribe()

      this.service.getRoleIdentityAttributes(this.id()).subscribe();

      this.service._identityAttributeRoleDetail$
        .pipe(
          filter((r) => !!r),
          tap((r) => {
              this.assignedIdentityAttributes = [...r];
              this.identityAttributes = [...this.assignedIdentityAttributes];
          })
        )
        .subscribe();
    }

    this.getIdentityAttributs();
  }

  getIdentityAttributs() {
    this.loading.set(true);

    const dateFrom = this.filtersSearch.get('updateTimestamp')?.value
      ? this.filtersSearch
        .get('updateTimestamp')
        ?.value?.startRange?.toISOString()
      : '';
    const dateTo = this.filtersSearch.get('updateTimestamp')?.value
      ? this.filtersSearch
        .get('updateTimestamp')
        ?.value?.endRange?.clone()
        .add(1, 'days')
        ?.toISOString()
      : '';

    const name = this.filtersSearch.get('name')?.value ?? undefined;
    const code = this.filtersSearch.get('code')?.value ?? undefined;

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
        page: this.paginator.page,
        size: this.paginator.pageSize,
        sort,
        code,
        name,
        assignableToRoles: null,
        enabled: null,
        updateTimestampFrom: dateFrom,
        updateTimestampTo: dateTo,
      }),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({participants, list}) => {

          const participantItems = (participants ?? []) as IdentityAttributeResponse[];
          const listItems = (list.items ?? []);

          const participantIds = new Set<string>(
            participantItems
              .map(p => p.id)
              .filter((id): id is string => !!id)
          );

          const itemsWithFlag = listItems.map(item => ({
            ...item,
            assignedToParticipant: item.id ? participantIds.has(item.id) : false,
          }) as IdentityAttributeResponse & { assignedToParticipant: boolean });

          this.data = itemsWithFlag;
          this.totalElems = list.total!;
          this.preSelected = this.retrievePreSelected();
        },
      });
  }

  onSortChange(newSortCriteria: Array<Sort>) {
    this.sortingCriteria = newSortCriteria.map((sort) => {
      return sort.sort + ',' + sort.order;
    });

    this.getIdentityAttributs();
  }

  retrievePreSelected(): Array<IdentityAttributeResponse> {
    const attributeSelected = (this.identityAttributes ?? []).concat(
      this.assignedIdentityAttributes ?? []
    );
    const preSelected = attributeSelected
      .filter((attr) => !!attr)
      .flatMap((attributeCode) => {
        const roleFound = this.data?.find(
          (attribute) => attribute.code === attributeCode?.code
        );
        return roleFound || [];
      });

    return preSelected || [];
  }

  onRole() {
    if (!this.id()) {
      this.service.createNewRole(this.role.getRawValue()).pipe(
        switchMap((role: Role) => {
          this.euiGrowlService.growl({
            severity: 'success',
            summary: this.translocoService.translate('newEditRole.newRole.saveSuccess'),
          });
          return this.service.assignIdentityAttributesToARole(role.id, this.identityAttributes);
        })
      ).subscribe({
        next: () => {
          this.router.navigate(['/roles']);
        },
        error: () => {
          this.euiGrowlService.growl({
            severity: 'danger',
            summary: this.translocoService.translate('newEditRole.newRole.saveError'),
          });
        }
      });
    } else {
      this.service.editRole(this.id(), this.role.getRawValue()).pipe(
        switchMap((role: Role) => {
          this.euiGrowlService.growl({
            severity: 'success',
            summary: this.translocoService.translate('newEditRole.editRole.editSuccess'),
          });
          return this.service.assignIdentityAttributesToARole(this.id(), this.identityAttributes);
        })
      ).subscribe({
        next: () => {
          this.router.navigate(['/roles']);
        },
        error: () => {
          this.euiGrowlService.growl({
            severity: 'danger',
            summary: this.translocoService.translate('newEditRole.editRole.editError'),
          });
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/roles']);
  }

  updateChips() {
    this.roleChips = Object.keys(this.filtersSearch.controls).flatMap(
      (field) => {
        if (field === 'updateTimestamp') {
          const chipsArray = [];
          const dateRange = this.filtersSearch.get(field)
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
          const value = this.filtersSearch.get(field)?.value;
          return value ? [{field, value}] : [];
        }
      }
    );
  }

  onRemoveChip(event: {
    chips: EuiChip[];
    removed: EuiChip | { chip: EuiChip; event: Event };
  }) {
    let filterValue;
    if (String((event.removed as EuiChip).id) === 'updateTimestampFrom') {
      filterValue = this.filtersSearch.get('updateTimestamp').value;
      filterValue.startRange = null;
      this.filtersSearch.get('updateTimestamp').patchValue(filterValue);
    }
    if (String((event.removed as EuiChip).id) === 'updateTimestampTo') {
      filterValue = this.filtersSearch.get('updateTimestamp').value;
      filterValue.endRange = null;
      this.filtersSearch.get('updateTimestamp').patchValue(filterValue);
    }
    this.filtersSearch.get(String((event.removed as EuiChip).id))?.reset();
    this.filtersSearch.updateValueAndValidity();
    this.getIdentityAttributs();
  }

  pageChange(e: EuiPaginationEvent): void {
    this.paginator = e;
    this.getIdentityAttributs();
  }

  onGetCheck(row: IdentityAttributeWithOwnership): boolean {
    const ind = this.identityAttributes.findIndex((el) => el.code === row.code);
    return ind !== -1;
  }

  onToggleCheckedState(event: MouseEvent, row: IdentityAttributeWithOwnership) {
    if ((event?.target as HTMLInputElement)?.checked) {
      this.identityAttributes.push(row);
    } else {
      this.identityAttributes = [...this.identityAttributes.filter((el) => el.code !== row.code)];
    }
  }

  onResetFilters() {
    this.filtersSearch.patchValue({
      name: null,
      code: null,
      updateTimestamp: {
        startRange: null,
        endRange: null,
      },
    });
    this.filtersSearch.updateValueAndValidity();
    this.getIdentityAttributs();
  }
}
