import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {TranslocoDirective, TranslocoService} from '@jsverse/transloco';
import { RouterLink } from '@angular/router';
import { EUI_BUTTON } from '@eui/components/eui-button';
import { EUI_ICON } from '@eui/components/eui-icon';
import { EUI_LABEL } from '@eui/components/eui-label';
import { EUI_TABLE_V2, Sort } from '@eui/components/eui-table-v2';
import {
  EUI_PAGINATOR,
  EuiPaginationEvent,
} from '@eui/components/eui-paginator';
import { EUI_BUTTON_GROUP } from '@eui/components/eui-button-group';
import { EUI_INPUT_GROUP } from '@eui/components/eui-input-group';
import { EUI_INPUT_TEXT } from '@eui/components/eui-input-text';
import { EUI_PAGE } from '@eui/components/eui-page';
import {
  EuiMaxLengthDirective,
  EuiTooltipDirective,
} from '@eui/components/directives';
import { EuiChip, EuiChipComponent } from '@eui/components/eui-chip';
import { RolesService } from '../roles.service';
import { finalize } from 'rxjs';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { RolesPagedResponse, Role } from '@simpl/api-client-usersroles-tier1-v2';
import { FilterChipsComponent } from '@fe-simpl/filter-chips';
import {EuiGrowlService} from "@eui/core";
import { EuiDialogConfig, EuiDialogService } from "@eui/components/eui-dialog";
import { TranslatePipe } from '@ngx-translate/core';
import { ReadableBooleanPipe, RoleDescriptionPipe } from '@shared/pipes';

@Component({
  selector: 'app-roles-information-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoDirective,
    ReactiveFormsModule,
    FilterChipsComponent,
    RouterLink,
    TranslatePipe,
    ReadableBooleanPipe,
    RoleDescriptionPipe,
    EuiMaxLengthDirective,
    EuiTooltipDirective,
    ...EUI_PAGE,
    ...EUI_INPUT_GROUP,
    ...EUI_LABEL,
    ...EUI_INPUT_TEXT,
    ...EUI_BUTTON_GROUP,
    ...EUI_BUTTON,
    ...EUI_TABLE_V2,
    ...EUI_ICON,
    ...EUI_PAGINATOR
  ],
  templateUrl: './roles-information-page.component.html',
})
export class RolesInformationPageComponent implements OnInit {
  private readonly service = inject(RolesService);
  private readonly euiGrowlService = inject(EuiGrowlService);
  private readonly translocoService = inject(TranslocoService);
  private readonly euiDialogService = inject(EuiDialogService);

  public pagination: EuiPaginationEvent;
  data: Array<Role> = [];
  totalElements = 0;
  loading = signal(false);

  sortingCriteria: Array<string> = [];
  filtersForm: FormGroup;
  chips: Array<{ field: string; value: string }> = [];
  mode = 'list';
  roleSelected: Role | null = null;

  ngOnInit(): void {
    this.filtersForm = new FormGroup({
      name: new FormControl(null),
      code: new FormControl(null),
    });

    this.pagination = {
      page: 0,
      pageSize: 5,
      nbPage: 5,
    };
    this.getRoleList();
  }

  getRoleList() {
    this.loading.set(true);

    const sort: string[] = [];
    if (this.sortingCriteria) {
      this.sortingCriteria.forEach((criteria) => {
        sort.push(criteria);
      });
    }

    this.updateChips();
    let { name, code } = this.filtersForm.value;
    name = name === '' ? null : name;
    code = code === '' ? null : code;
    this.service
      .getRoleList(this.pagination.page, this.pagination.pageSize, sort, name, code)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: RolesPagedResponse) => {
          // console.log(response)
          this.totalElements = response.total
          this.data = response.items
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  updateChips() {
    this.chips = Object.keys(this.filtersForm.controls)
      .filter((field) => !!this.filtersForm.get(field)?.value)
      .map((field) => ({ field, value: this.filtersForm.get(field)?.value }));
  }

  removeChip(
    event:
      | EuiChip
      | EuiChipComponent
      | { chip: EuiChipComponent | EuiChip; event?: Event }
  ) {
    this.filtersForm.get(String((event as EuiChip).id))?.reset();
    this.filtersForm.updateValueAndValidity();
    this.getRoleList();
  }

  onPageChange(e: EuiPaginationEvent): void {
    this.pagination = e;
    this.getRoleList();
  }

  onSortChange(newSortCriteria: Array<Sort>) {
    this.sortingCriteria = newSortCriteria.map((sort) => {
      if (sort.order === 'asc') return sort.sort;
      return '-' + sort.sort;
    });

    this.getRoleList();
  }

  resetFilters() {
    this.filtersForm.reset();
    this.filtersForm.updateValueAndValidity();
    this.getRoleList();
  }

  onDelete(role: Role) {
    const config = new EuiDialogConfig({
      title: this.translocoService.translate('deleteRole.title'),
      content: this.translocoService.translate('deleteRole.content', { roleName: role.name }),
      accept: () => {
        this.service.deleteRole(role.id).subscribe({
          next: () => {
            this.getRoleList();
            this.euiGrowlService.growl({
              severity: 'success',
              summary: this.translocoService.translate('deleteRole.saveSuccess'),
            });
          },
          error: () => {
            this.euiGrowlService.growl({
              severity: 'danger',
              summary: this.translocoService.translate('deleteRole.saveError'),
            });
          }
        })
      }
    });

    this.euiDialogService.openDialog(config);
  }
}
