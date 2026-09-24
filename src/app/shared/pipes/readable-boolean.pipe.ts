import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'readableBoolean',
  standalone: true,
  pure: true
})
export class ReadableBooleanPipe implements PipeTransform {
  transform(value: boolean | string): string {

    const parsedValue = String(value);
    if (/^true$/.test(parsedValue)) {
      return 'common.yes';
    }
    if (/^false$/.test(parsedValue)) {
      return 'common.no';
    }

    throw new Error(`${parsedValue} is not a valid value`);
  }
}
