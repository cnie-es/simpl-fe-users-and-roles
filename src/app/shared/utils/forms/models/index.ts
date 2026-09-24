import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Moment } from 'moment-timezone';

export type FormControlTypeMap<T> =
  T extends string | null | undefined ? FormControl<string | null> :
    T extends boolean | null | undefined ? FormControl<boolean | null> :
      T extends number | null | undefined ? FormControl<number | null> :
        T extends (string | Moment) | null | undefined ? FormControl<string | Date | null> :
          T extends Array<infer U> ? FormArray<FormGroupType<U>> :
            FormControl<T | null>;

export type FormGroupType<T> = FormGroup<{
  [K in keyof T]: T[K] extends Array<infer U>
    ? FormArray<FormGroupType<U>>
    : FormControlTypeMap<T[K]>
}>;

export type FormValidationError = {
  minLength?: boolean;
  maxLength?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  numeric?: boolean;
  specialChar?: boolean;
  forbidden?: boolean;
}
