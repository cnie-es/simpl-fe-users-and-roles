import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'lib-error-page',
  standalone: true,
  imports: [CommonModule, TranslocoDirective],
  templateUrl: './error-page.component.html',
})
export class ErrorPageComponent {
  errorData?: HttpErrorResponse;

  constructor(private readonly router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.errorData = navigation.extras.state['error'];
    }
  }
}
