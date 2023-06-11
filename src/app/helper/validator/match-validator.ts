import {AbstractControl, ValidatorFn} from '@angular/forms';

export function matchValidator(control: AbstractControl, controlTwo: AbstractControl): ValidatorFn {
  return () => {
    console.log(control.value);
    if (control.value !== controlTwo.value) return {match_error: 'Value does not match'};
    return null;
  };
}
