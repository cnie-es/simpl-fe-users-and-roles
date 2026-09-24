import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'lib-unauthorized-page',
  standalone: true,
  imports: [CommonModule, TranslocoDirective],
  templateUrl: './unauthorized-page.component.html'
})
export class UnauthorizedPageComponent {
}
