import { ValidationMessages } from '../types/validation.types';

export const DEFAULT_ERROR_MESSAGES: ValidationMessages<{ requiredLength: number }> = {
  required: name => `${name} is required`,
  email: () => `Please enter a valid email address`,
  minlength: (name, err) => `${name} must be at least ${err?.['requiredLength']} characters`,
  maxlength: (name, err) => `${name} must be maximum ${err?.['requiredLength']} characters`,
};
