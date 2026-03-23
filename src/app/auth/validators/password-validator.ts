import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';

  const hasUpper: boolean = /[A-Z]/.test(value);
  const hasLower: boolean = /[a-z]/.test(value);
  const hasDigit: boolean = /\d/.test(value);
  const hasSpecial: boolean = /[!@#$%^&*(),.?":{}|<>]/.test(value);

  const failed: string[] = [];
  if (!hasUpper) {
    failed.push('uppercase letter');
  }
  if (!hasLower) {
    failed.push('lowercase letter');
  }
  if (!hasDigit) {
    failed.push('digit');
  }
  if (!hasSpecial) {
    failed.push('special character');
  }

  if (failed.length > 0) {
    return { passwordWeak: { requirements: failed } };
  }

  return null;
}
