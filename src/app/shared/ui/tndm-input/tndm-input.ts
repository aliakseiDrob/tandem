import { ChangeDetectionStrategy, Component, DestroyRef, inject, input } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';
import { DEFAULT_ERROR_MESSAGES } from '../../constants/error-messages.constant';
import { ICONS } from '../../constants/icons.constant';
import { SvgIconComponent } from 'angular-svg-icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ValidationMessages } from '../../types/validation.types';

export const typeInput = {
  email: 'email',
  password: 'password',
  search: 'search',
  tel: 'tel',
  text: 'text',
  url: 'url',
} as const;

export type InputType = keyof typeof typeInput;

@Component({
  selector: 'tndm-input',
  imports: [ReactiveFormsModule, SvgIconComponent],
  templateUrl: './tndm-input.html',
  styleUrl: './tndm-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TndmInput<T = unknown> implements ControlValueAccessor {
  private readonly controlDir = inject(NgControl, { self: true, optional: true });
  private readonly destroyRef = inject(DestroyRef);
  readonly control = new FormControl('');

  readonly id = input.required<string>();
  readonly name = input.required<string>();

  readonly label = input<string | null>(null);
  readonly type = input<InputType>('text');
  readonly placeholder = input<string | null>(null);
  readonly errorMessages = input<ValidationMessages<T>>({});
  readonly trimmed = input<boolean>(false);

  readonly icon = input<keyof typeof ICONS | null>(null);
  readonly ICONS = ICONS;

  onChange: (val: string | null) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
    this.control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      let finalValue = value;
      if (this.trimmed() && typeof value === 'string') {
        finalValue = value.trim();
        if (finalValue !== value) {
          this.control.setValue(finalValue, { emitEvent: false });
        }
      }
      this.onChange(finalValue);
    });
    if (this.controlDir) {
      this.controlDir.valueAccessor = this;
    }
  }

  writeValue(value: string | null): void {
    this.control.setValue(value ?? '', { emitEvent: false });
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }

  isError(): boolean {
    const control = this.controlDir?.control;
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }

  textError(): string | null {
    const control = this.controlDir?.control;
    if (!control || !control.errors) {
      return null;
    }

    const errorKeys = Object.keys(control.errors);
    const errorName = errorKeys[0];
    const errorContext = control.errors[errorName];

    const custom = this.errorMessages();
    const defaults = DEFAULT_ERROR_MESSAGES;

    const handler = custom[errorName] || defaults[errorName];

    if (handler) {
      return typeof handler === 'function' ? handler(this.name(), errorContext).toLowerCase() : handler.toLowerCase();
    }

    return `error: ${errorName}`;
  }
}
