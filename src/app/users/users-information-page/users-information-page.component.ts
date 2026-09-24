import {Component, inject, OnInit, signal, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslocoDirective, TranslocoService} from '@jsverse/transloco';
import {finalize} from 'rxjs';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {UsersService} from '../users.service';
import {RoleListModalComponent, UserRolesDialogData,} from './role-list-modal/role-list-modal.component';
import {EUI_BUTTON} from '@eui/components/eui-button';
import {EUI_ICON} from '@eui/components/eui-icon';
import {EUI_LABEL} from '@eui/components/eui-label';
import {EUI_TABLE_V2} from '@eui/components/eui-table-v2';
import {EUI_PAGINATOR, EuiPaginationEvent,} from '@eui/components/eui-paginator';
import {EUI_DIALOG, EuiDialogComponent, EuiDialogConfig, EuiDialogService} from '@eui/components/eui-dialog';
import {EUI_PAGE} from '@eui/components/eui-page';
import {EUI_INPUT_GROUP} from '@eui/components/eui-input-group';
import {EUI_INPUT_TEXT} from '@eui/components/eui-input-text';
import {EUI_BUTTON_GROUP} from '@eui/components/eui-button-group';
import {EuiChip, EuiChipComponent} from '@eui/components/eui-chip';
import {EuiMaxLengthDirective, EuiTooltipDirective} from '@eui/components/directives';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {HttpParams} from '@angular/common/http';
import {FilterChipsComponent} from '@fe-simpl/filter-chips';
import {EuiGrowlService} from "@eui/core";
import {Role, User, UsersPagedResponse} from "@simpl/api-client-usersroles-tier1-v2";
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-users-information-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoDirective,
    RoleListModalComponent,
    ReactiveFormsModule,
    FilterChipsComponent,
    TranslatePipe,
    EuiMaxLengthDirective,
    ...EUI_PAGE,
    ...EUI_BUTTON,
    ...EUI_ICON,
    ...EUI_INPUT_GROUP,
    ...EUI_LABEL,
    ...EUI_INPUT_TEXT,
    ...EUI_BUTTON_GROUP,
    ...EUI_TABLE_V2,
    ...EUI_PAGINATOR,
    ...EUI_DIALOG,
    RouterLink,
    EuiTooltipDirective,
  ],
  templateUrl: './users-information-page.component.html',
})
export class UsersInformationPageComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly translocoService = inject(TranslocoService);
  private readonly euiGrowlService = inject(EuiGrowlService);
  private readonly dialogService = inject(EuiDialogService);

  data: UsersPagedResponse = null;
  loading = signal(false);

  public pagination: EuiPaginationEvent;

  filtersForm: FormGroup;
  chips: Array<{ field: string; value: string }> = [];

  @ViewChild('dialog') dialog: EuiDialogComponent;
  roleDialogData: UserRolesDialogData = {
    roles: [],
    title: '',
    cancel: '',
    noRoles: '',
  };

  ngOnInit(): void {
    this.filtersForm = new FormGroup({
      email: new FormControl(''),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      username: new FormControl(''),
    });

    this.pagination = {
      page: 0,
      pageSize: 5,
      nbPage: 5,
    };

    this.search();
  }

  search() {
    this.loading.set(true);

    let searchFilters: HttpParams = new HttpParams()
      .set('page', this.pagination.page)
      .set('size', this.pagination.pageSize);

    if (this.filtersForm.value) {
      for (const [key, value] of Object.entries(
        this.filtersForm.getRawValue()
      )) {
        if (value) {
          searchFilters = searchFilters.append(key, value as string);
        }
      }
    }

    this.updateChips();

    this.usersService
      .getUserList(
        this.pagination.page,
        this.pagination.pageSize,
        this.filtersForm.get('firstName')?.value,
        this.filtersForm.get('lastName')?.value,
        this.filtersForm.get('username')?.value,
        this.filtersForm.get('email')?.value
      )
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.data = response;
        },
      });
  }

  onPageChange(e: EuiPaginationEvent): void {
    this.pagination = e;
    this.search();
  }

  removeChip(
    event:
      | EuiChip
      | EuiChipComponent
      | { chip: EuiChipComponent | EuiChip; event?: Event }
  ) {
    this.filtersForm.get(String((event as EuiChip).id))?.reset();
    this.filtersForm.updateValueAndValidity();
    this.search();
  }

  resetFilters() {
    this.filtersForm.reset();
    this.filtersForm.updateValueAndValidity();
    this.search();
  }

  showUserRoles(row: User) {
    this.loading.set(true);

    this.roleDialogData.title = this.translocoService.translate(
      'userInformationPage.userRoles'
    );
    this.roleDialogData.noRoles = 'userInformationPage.noRoles';
    this.roleDialogData.cancel = this.translocoService.translate(
      'userInformationPage.cancel'
    );

    this.usersService
      .getUserRoles(row.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (roles: Role[]) => {
          this.roleDialogData.roles = roles;
          this.dialog.openDialog();
        },
      });
  }

  updateChips() {
    this.chips = Object.keys(this.filtersForm.controls)
      .filter((field) => !!this.filtersForm.get(field)?.value)
      .map((field) => ({ field, value: this.filtersForm.get(field)?.value }));
  }

  navigateToUserCreation() {
    this.router.navigate(['/users/new-user'], { relativeTo: this.route });
  }

  onDeleteUser(user: User) {
    const config = new EuiDialogConfig({
      title: this.translocoService.translate('deleteUser.title'),
      content: this.translocoService.translate('deleteUser.content', {username: user.username}),
      width: '30vw',
      accept: () => {
        this.usersService.deleteUser(user.id).subscribe({
          next: () => {
            this.euiGrowlService.growl({
              severity: 'success',
              summary: this.translocoService.translate('deleteUser.saveSuccess'),
            });
            this.search();
          },
          error: (err) => {
            this.euiGrowlService.growl({
              severity: 'danger',
              summary: this.translocoService.translate('deleteUser.saveError'),
            });
          }
        })
      }
    })
    this.dialogService.openDialog(config);
  }
}
