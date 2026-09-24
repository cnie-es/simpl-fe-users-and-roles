import { inject, LOCALE_ID, Pipe, PipeTransform, signal, WritableSignal } from '@angular/core';
import { I18nService, LOCALE_ID_MAPPER } from '@eui/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'i18nDate',
  standalone: true,
  pure: false
})
export class I18nDatePipe implements PipeTransform {

  readonly #localeId = inject(LOCALE_ID);
  readonly #localeMapper = inject(LOCALE_ID_MAPPER);
  readonly #i18nService = inject(I18nService);
  locale: WritableSignal<string> = signal(this.#localeId);

  constructor() {
    this.#i18nService.onStateChange.subscribe((locale) => {
      this.locale.set(this.#localeMapper(locale.activeLang))
    })
  }


  transform(value: Date | string | number): string | null {
  const datePipe = new DatePipe(this.locale(), null, { dateFormat: 'shortDate' });
    return datePipe.transform(value);
  }
}
