import { computed, Injectable, signal } from '@angular/core';

export const TOAST_STATE = {
  success: 'success',
  warning: 'warning',
  info: 'info',
  danger: 'danger',
} as const;

export type ToastStateType = keyof typeof TOAST_STATE;

export type ToastOptions = {
  duration: number | null;
  icon: boolean;
};

export type ToastType = {
  title: string;
  message?: string;
  state: ToastStateType;
  id: number;
  options: ToastOptions;
  open?: boolean;
};

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _idCounter = 0;
  private readonly _toasts = signal<ToastType[]>([]);

  readonly toasts = this._toasts.asReadonly();
  readonly shows = computed(() => this._toasts().length > 0);

  private readonly defaultOptions: ToastOptions = {
    duration: 5000,
    icon: true,
  };

  danger(title: string, message: string, options?: Partial<ToastOptions>): void {
    this.show(title, message, 'danger', options);
  }

  success(title: string, message: string, options?: Partial<ToastOptions>): void {
    this.show(title, message, 'success', options);
  }
  info(title: string, message: string, options?: Partial<ToastOptions>): void {
    this.show(title, message, 'info', options);
  }
  warning(title: string, message: string, options?: Partial<ToastOptions>): void {
    this.show(title, message, 'warning', options);
  }

  private show(title: string, message: string, state: ToastStateType, options?: Partial<ToastOptions>): void {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const newId = this._idCounter++;

    const newToast: ToastType = {
      title,
      message,
      state,
      id: newId,
      options: mergedOptions,
    };

    this._toasts.update(toasts => [...toasts, newToast]);

    if (mergedOptions.duration) {
      setTimeout(() => this.remove(newId), mergedOptions.duration);
    }
  }

  remove(id: number): void {
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  removeAll(): void {
    this._toasts.set([]);
  }
}
