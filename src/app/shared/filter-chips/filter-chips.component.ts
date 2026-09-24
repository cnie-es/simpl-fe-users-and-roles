import { Component, input, InputSignal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EUI_CHIP, EuiChip, EuiChipComponent } from '@eui/components/eui-chip';
import { EUI_LABEL } from '@eui/components/eui-label';
import { TranslocoDirective } from '@jsverse/transloco';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'lib-filter-chips',
  imports: [CommonModule, TranslocoDirective, TranslatePipe, ...EUI_CHIP, ...EUI_LABEL],
  templateUrl: './filter-chips.component.html',
})
export class FilterChipsComponent {
  // NOTE: Not sure if this is the best way to handle translations
  translocoPrefix: InputSignal<string> = input('');
  chips: InputSignal<Array<{ field: string; value: string }>> =
    input.required();
  removeChip = output<
    | EuiChip
    | EuiChipComponent
    | { chip: EuiChipComponent | EuiChip; event?: Event }
  >();
  resetFilters = output<void>();

  onRemoveChip(
    $event:
      | EuiChip
      | EuiChipComponent
      | { chip: EuiChipComponent | EuiChip; event?: Event }
  ) {
    this.removeChip.emit($event);
  }

  onResetFilters() {
    this.resetFilters.emit();
  }
}
