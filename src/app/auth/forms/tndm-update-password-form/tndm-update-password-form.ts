import { ChangeDetectionStrategy, Component, computed, Signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonConfig, TndmButton } from '../../../shared/ui/tndm-button/tndm-button';
import { TndmInput } from '../../../shared/ui/tndm-input/tndm-input';
import { TndmAuthFormCore } from '../../tndm-auth-form-core/tndm-auth-form-core';
import { FormField } from '../../enums/auth-field-types';
import { AUTH_ROUTES } from '@auth';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'tndm-update-password-form',
  imports: [TndmButton, TndmInput, ReactiveFormsModule],
  templateUrl: './tndm-update-password-form.html',
  styleUrl: './tndm-update-password-form.scss',
})
export class TndmUpdatePasswordForm extends TndmAuthFormCore {
  protected readonly updatePasswordBtnConfig: Signal<ButtonConfig> = computed(() => ({
    variant: 'secondary',
    label: 'Update Password',
    isDisabled: !this.canSubmit(),
    type: 'submit',
  }));

  protected readonly toMainBtnConfig: Signal<ButtonConfig> = computed(() => ({
    variant: 'secondary',
    label: 'Main',
    isDisabled: this.isLoading(),
  }));

  constructor() {
    super();
  }

  protected override buildForm(): void {
    this.form.addControl(FormField.password, this.passwordControl);
  }
  protected override async handleSubmit(): Promise<void> {
    await this.authService.updatePassword(this.passwordControl.value);

    await this.authService.logout();
    this.toastService.info('Пароль обновлён', 'Войдите с новым паролем');
    await this.router.navigateByUrl(AUTH_ROUTES.LOGIN);
  }
}
