// index.spec.ts
import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import {
  confirmPasswordValidator,
  detailedPasswordValidation,
  startEndDateRangeValidator,
} from './index';
import moment from 'moment-timezone';

describe('confirmPasswordValidator', () => {
  it('it should return null if there are no error', () => {
    const form = new FormGroup({
      password: new FormControl('Secret123!'),
      confirmPassword: new FormControl('Secret123!'),
    });

    const result = confirmPasswordValidator(form);
    expect(result).toBeNull();
  });

  it('sets noMatch when passwords do not match and preserves existing errors', () => {
    const form = new FormGroup({
      password: new FormControl('Secret123!'),
      confirmPassword: new FormControl('Secret1234!'),
    });
    form.get('confirmPassword')!.setErrors({ required: true });

    confirmPasswordValidator(form);

    expect(form.get('confirmPassword')!.errors).toEqual({
      required: true,
      noMatch: true,
    });
  });

  it('removes only noMatch when passwords match and keeps other errors', () => {
    const form = new FormGroup({
      password: new FormControl('Secret123!'),
      confirmPassword: new FormControl('Secret123!'),
    });
    form.get('confirmPassword')!.setErrors({ noMatch: true, required: true });

    confirmPasswordValidator(form);

    expect(form.get('confirmPassword')!.errors).toEqual({ required: true });
  });

  it('clears errors when only noMatch is present and passwords match', () => {
    const form = new FormGroup({
      password: new FormControl('Secret123!'),
      confirmPassword: new FormControl('Secret123!'),
    });
    form.get('confirmPassword')!.setErrors({ noMatch: true });

    confirmPasswordValidator(form);

    expect(form.get('confirmPassword')!.errors).toBeNull();
  });

  it('does nothing when passwords match and no noMatch error exists', () => {
    const form = new FormGroup({
      password: new FormControl('Secret123!'),
      confirmPassword: new FormControl('Secret123!'),
    });
    form.get('confirmPassword')!.setErrors({ minlength: true });

    confirmPasswordValidator(form);

    expect(form.get('confirmPassword')!.errors).toEqual({ minlength: true });
  });
});


describe('detailedPasswordValidation', () => {

    const control = new FormControl('');
    const form = new FormGroup({password: control}, detailedPasswordValidation)

    beforeEach(() => {
      control.reset("");
      control.updateValueAndValidity();
    })


    it('should return no errors for a valid password', () => {
      const password16Chars = 'Valid@Password12';
        control.setValue(password16Chars);
      control.updateValueAndValidity();
        expect(form.errors).toBeNull();
    });

    it('should return "minLength" error for passwords shorter than 16 characters', () => {
      const password15Chars = 'Short@Password1';
        control.setValue(password15Chars);
        expect(form.errors).toEqual({passwordMinLength: true});
    });

    it('should not return "maxLength" error for passwords of exactly 32 characters', () => {
        const password32Chars = 'A'.repeat(29) + '1@a';
        control.setValue(password32Chars);
        expect(form.errors).toBeNull();
    });

    it('should return "maxLength" error for passwords longer than 32 characters', () => {
        const password33Chars = 'A'.repeat(30) + '1@a';
        control.setValue(password33Chars);
        expect(form.errors).toEqual({passwordMaxLength: true});
    });

    it('should return "uppercase" error when there is no uppercase letter', () => {
        control.setValue('lowercase@123456');
        expect(form.errors).toEqual({passwordUppercase: true});
    });

    it('should return "lowercase" error when there is no lowercase letter', () => {
      control.setValue('UPPERCASE@123456');
      expect(form.errors).toEqual({passwordLowercase: true});
    });

    it('should return "numeric" error when there is no number', () => {
        control.setValue('Password@!password');
        expect(form.errors).toEqual({passwordNumeric: true});
    });

    it('should return "specialChar" error when there is no special character', () => {
      control.setValue('Password12345678');
      expect(form.errors).toEqual({passwordSpecialChar: true});
    });

    it('should return "forbidden" error if password contains forbidden values', () => {
        const group = new FormGroup({
            password: new FormControl(''),
            applicant: new FormGroup({
                firstName: new FormControl('Michael'),
                lastName: new FormControl('Jordan'),
                username: new FormControl('johndoe'),
                email: new FormControl('john.doe@example.com'),
            }),
            organization: new FormControl('orgXYZ'),
        }, detailedPasswordValidation);

        group.get('password')?.setValue('john12345!Jordan');
        group.get('password')?.updateValueAndValidity();

        expect(group.errors).toEqual({passwordForbidden: true});
    });
});

describe('startEndDateRangeValidator', () => {
  it('should return no errors for valid start and end dates', () => {
    const control = new FormControl({
      startRange: moment('2025-01-01'),
      endRange: moment('2025-12-31'),
    });
    const result: ValidationErrors | null = startEndDateRangeValidator(control);
    expect(result).toBeNull();
  });

  it('should return error for invalid date range (start date after end date)', () => {
    const control = new FormControl({
      startRange: moment('2025-12-31'),
      endRange: moment('2025-01-01'),
    });
    const result: ValidationErrors | null = startEndDateRangeValidator(control);
    expect(result).toEqual({dateRangeInvalid: true});
  });

  it('should return no errors when control value is null', () => {
    const control = new FormControl(null);
    const result: ValidationErrors | null = startEndDateRangeValidator(control);
    expect(result).toBeNull();
  });

  it('should return no errors when control value is not an object', () => {
    const control = new FormControl('not-an-object');
    const result: ValidationErrors | null = startEndDateRangeValidator(control);
    expect(result).toBeNull();
  });

  it('should return no errors when startRange or endRange is not a moment object', () => {
    const control = new FormControl({
      startRange: '2025-01-01',
      endRange: '2025-12-31',
    });
    const result: ValidationErrors | null = startEndDateRangeValidator(control);
    expect(result).toBeNull();
  });
});
