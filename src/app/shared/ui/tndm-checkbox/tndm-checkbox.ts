import { ChangeDetectionStrategy, Component, DestroyRef, inject, input } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'tndm-checkbox',
  imports: [ReactiveFormsModule],
  templateUrl: './tndm-checkbox.html',
  styleUrl: './tndm-checkbox.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TndmCheckbox implements ControlValueAccessor {
  private readonly controlDir = inject(NgControl, { self: true, optional: true });
  private readonly destroyRef = inject(DestroyRef);
  readonly control = new FormControl({ value: false, disabled: false });

  readonly id = input.required<string>();
  readonly name = input.required<string>();

  readonly label = input<string | null>(null);

  onChange: (val: boolean) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
    this.control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => this.onChange(!!value));
    if (this.controlDir) {
      this.controlDir.valueAccessor = this;
    }
  }

  writeValue(value: boolean): void {
    this.control.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: boolean) => void): void {
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
}
