import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeUnderscore',
  standalone: true,
})
export class RemoveUnderscorePipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): unknown {
    if (!value) {
      return value;
    }
    return value.replace(/_/g, ' ');
  }
}
