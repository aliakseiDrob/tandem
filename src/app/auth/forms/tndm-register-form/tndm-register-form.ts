import { ChangeDetectionStrategy, Component, computed, Signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TndmInput } from '../../../shared/ui/tndm-input/tndm-input';
import { ButtonConfig, TndmButton } from '../../../shared/ui/tndm-button/tndm-button';
import { AUTH_ROUTES } from '../../';
import { RouterLink } from '@angular/router';
import { TndmAuthFormCore } from '../../tndm-auth-form-core/tndm-auth-form-core';
import { FormField } from '../../enums/auth-field-types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'tndm-register-form',
  imports: [TndmButton, TndmInput, ReactiveFormsModule, RouterLink],
  templateUrl: './tndm-register-form.html',
  styleUrl: './tndm-register-form.scss',
})
export class TndmRegisterForm extends TndmAuthFormCore {
  protected readonly toForgotPasswordPath: string = AUTH_ROUTES.FORGOT_PASSWORD;

  protected readonly signUpBtnConfig: Signal<ButtonConfig> = computed(() => ({
    label: 'Sign-Up',
    type: 'submit',
    isDisabled: !this.canSubmit(),
  }));

  protected readonly signWithGoogleBtnConfig: Signal<ButtonConfig> = computed(() => ({
    icon: 'google',
    variant: 'black',
    label: 'Sign-Up with Google',
    isDisabled: this.isLoading(),
  }));

  protected readonly signWithGithubBtnConfig: Signal<ButtonConfig> = computed(() => ({
    icon: 'github',
    variant: 'black',
    label: 'Sign-Up with Github',
    isDisabled: this.isLoading(),
  }));

  protected readonly toLoginBtnConfig: Signal<ButtonConfig> = computed(() => ({
    variant: 'secondary',
    label: 'Sign-in',
  }));

  constructor() {
    super();
  }

  protected override buildForm(): void {
    this.form.addControl(FormField.login, this.loginControl);
    this.form.addControl(FormField.email, this.emailControl);
    this.form.addControl(FormField.password, this.passwordControl);
  }

  protected override async handleSubmit(): Promise<void> {
    const login: string = this.loginControl.value;
    const email: string = this.emailControl.value;
    const password: string = this.passwordControl.value;

    await this.authService.register(login, email, password);

    await this.navigateToMain();
  }
}
