import { ValidationMessages } from '../../shared/types/validation.types';

export const AUTH_ERROR_MESSAGES: ValidationMessages<{ requirements: string[] }> = {
  passwordWeak: (name: string, err?): string => {
    const reqs: string[] = err?.requirements || [];
    if (reqs.length > 0) {
      return `${name} must contain: ${reqs.join(', ')}`;
    }
    return `${name} too weak`;
  },
  loginInvalid: (name: string, err?): string => {
    const reqs: string[] = err?.requirements || [];
    if (reqs.length > 0) {
      return `${name} must contain: ${reqs.join(', ')}`;
    }
    return `${name} invalid format`;
  },
} as const;

export type AuthErrorKey = keyof typeof AUTH_ERROR_MESSAGES;
