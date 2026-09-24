import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'removePlaceholder'
})
export class RemovePlaceholderPipe implements PipeTransform {
  transform(value: unknown): unknown {
    if (typeof value !== 'string') {
      return value;
    }
    if (!value) return value;
    return value.replace(/^\$\{(.+)}$/, '$1');
  }
}
