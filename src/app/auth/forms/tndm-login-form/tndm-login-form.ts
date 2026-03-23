import { ChangeDetectionStrategy, Component, computed, Signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TndmInput } from '../../../shared/ui/tndm-input/tndm-input';
import { ButtonConfig, TndmButton } from '../../../shared/ui/tndm-button/tndm-button';
import { RouterLink } from '@angular/router';
import { AUTH_ROUTES } from '../../';
import { TndmAuthFormCore } from '../../tndm-auth-form-core/tndm-auth-form-core';
import { FormField } from '../../enums/auth-field-types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'tndm-login-form',
  imports: [ReactiveFormsModule, TndmInput, TndmButton, RouterLink],
  templateUrl: './tndm-login-form.html',
  styleUrl: './tndm-login-form.scss',
})
export class TndmLoginForm extends TndmAuthFormCore {
  protected readonly toForgotPasswordPath: string = AUTH_ROUTES.FORGOT_PASSWORD;

  protected readonly signInBtnConfig: Signal<ButtonConfig> = computed(() => ({
    label: 'Sign-In',
    type: 'submit',
    isDisabled: !this.canSubmit(),
  }));

  protected readonly signWithGoogleBtnConfig: Signal<ButtonConfig> = computed(() => ({
    icon: 'google',
    variant: 'black',
    label: 'Sign-In with Google',
    isDisabled: this.isLoading(),
  }));
  protected readonly signWithGithubBtnConfig: Signal<ButtonConfig> = computed(() => ({
    icon: 'github',
    variant: 'black',
    label: 'Sign-In with Github',
    isDisabled: this.isLoading(),
  }));

  protected readonly toRegisterBtnConfig: Signal<ButtonConfig> = computed(() => ({
    variant: 'secondary',
    label: 'Sign-up',
    isDisabled: this.isLoading(),
  }));

  constructor() {
    super();
  }

  protected override buildForm(): void {
    this.form.addControl(FormField.email, this.emailControl);
    this.form.addControl(FormField.password, this.passwordControl);
  }

  protected override async handleSubmit(): Promise<void> {
    await this.authService.login(this.emailControl.value, this.passwordControl.value);

    await this.navigateToMain();
  }
}
