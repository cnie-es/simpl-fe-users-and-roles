import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import moment from 'moment-timezone';

export const passwordMinLength = 16;
export const passwordMaxLength = 32;

export const confirmPasswordValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const passwordControl = control.get('password');
  const confirmPasswordControl = control.get('confirmPassword');

  const match = passwordControl?.value === confirmPasswordControl?.value;

  if (passwordControl && confirmPasswordControl && !match) {
    confirmPasswordControl.setErrors({
      ...confirmPasswordControl.errors,
      noMatch: true,
    });
  } else {
    const currentErrors = confirmPasswordControl?.errors;
    if (currentErrors && 'noMatch' in currentErrors) {
      const { noMatch, ...otherErrors } = currentErrors;
      confirmPasswordControl.setErrors(
        Object.keys(otherErrors).length > 0 ? otherErrors : null
      );
    }
  }

  return null;
};

interface PasswordValidationConfig {
  minLength: number;
  maxLength: number;
  minSubstringLength: number;
  forbiddenFields: string[];
}

const DEFAULT_CONFIG: PasswordValidationConfig = {
  minLength: passwordMinLength,
  maxLength: passwordMaxLength,
  minSubstringLength: 5,
  forbiddenFields: [
    'applicant.email',
    'organization',
    'applicant.lastName',
    'applicant.firstName',
    'applicant.username'
  ]
};
function sanitizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function generateSubstrings(str: string, minLength: number): Set<string> {
  const substrings = new Set<string>();
  const sanitized = sanitizeString(str);

  if (sanitized.length < minLength) {
    return substrings;
  }

  for (let length = minLength; length <= sanitized.length; length++) {
    for (let i = 0; i <= sanitized.length - length; i++) {
      const substring = sanitized.substring(i, i + length);
      substrings.add(substring);
    }
  }

  return substrings;
}


function checkForbiddenSubstrings(
  password: string,
  forbiddenValues: string[],
  minSubstringLength: number
): boolean {
  const sanitizedPassword = sanitizeString(password);

  return forbiddenValues.some(value => {
    if (!value || typeof value !== 'string' || value.trim().length < minSubstringLength) {
      return false;
    }

    const substrings = generateSubstrings(value.trim(), minSubstringLength);
    return Array.from(substrings).some(substring =>
      sanitizedPassword.includes(substring)
    );
  });
}

export function createPasswordValidator(
  config: Partial<PasswordValidationConfig> = {}
): ValidatorFn {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.get('password')?.value;
    const errors: ValidationErrors = {};

    if (!value || typeof value !== 'string' || value == '') {
      return {
          passwordRequired: true,
          passwordMinLength: true,
          passwordMaxLength: true,
          passwordUppercase: true,
          passwordLowercase: true,
          passwordNumeric: true,
          passwordSpecialChar: true,
      };
    }

    if (value.length < finalConfig.minLength) {
      errors['passwordMinLength'] = true;
    }

    if (value.length > finalConfig.maxLength) {
      errors['passwordMaxLength'] = true;
    }

    if (!/[A-Z]/.test(value)) {
      errors['passwordUppercase'] = true;
    }

    if (!/[a-z]/.test(value)) {
      errors['passwordLowercase'] = true;
    }

    if (!/\d/.test(value)) {
      errors['passwordNumeric'] = true;
    }

    if (!/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/.test(value)) {
      errors['passwordSpecialChar'] = true;
    }

    try {
      const forbiddenValues = finalConfig.forbiddenFields
        .map(field => control.root?.get(field)?.value)
        .filter(val => val != null);

      if (checkForbiddenSubstrings(value, forbiddenValues, finalConfig.minSubstringLength)) {
        errors['passwordForbidden'] = true;
      }
    } catch (error) {
      console.warn('Error accessing form controls in password validator:', error);
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}

export const detailedPasswordValidation: ValidatorFn = createPasswordValidator();



export function startEndDateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (!value || typeof value !== 'object') {
    return null;
  }

  const { startRange, endRange } = value;

  if (!moment.isMoment(startRange) || !moment.isMoment(endRange)) {
    return null;
  }

  return startRange.isSameOrBefore(endRange)
    ? null
    : { dateRangeInvalid: true };
}
