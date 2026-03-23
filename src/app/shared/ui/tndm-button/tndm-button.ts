import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ICONS } from '../../constants/icons.constant';

@Component({
  selector: 'tndm-button',
  imports: [AngularSvgIconModule],
  templateUrl: './tndm-button.html',
  styleUrl: './tndm-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TndmButton {
  readonly btnConfig = input.required<ButtonConfig>();
  readonly clicked = output<MouseEvent>();
  private defaultConfig: Partial<ButtonConfig> = {
    variant: 'primary',
    size: 'md',
    isDisabled: false,
    type: 'button',
  };
  readonly ICONS = ICONS;

  readonly config = computed(() => ({
    ...this.defaultConfig,
    ...this.btnConfig(),
  }));

  readonly buttonClass = computed(() => {
    const { variant, size } = this.config();
    return `button_variant_${variant} button_size_${size}`;
  });

  readonly isDisabled = computed(() => this.config().isDisabled ?? false);

  readonly formattedLabel = computed(() => {
    const label = this.config().label;
    if (!label) {
      return null;
    }
    return `${this.config().variant === 'primary' && !this.config().icon ? '> ' : ''} ${label}`;
  });

  onClick(event: MouseEvent): void {
    if (!this.isDisabled()) {
      this.clicked.emit(event);
    }
  }
}

type ButtonBase = {
  size?: 'sm' | 'md' | 'lg';
  place?: string;
  isDisabled?: boolean;
  type?: 'button' | 'submit';
};

type SecondaryButton = ButtonBase & {
  variant: 'secondary';
  label: string;
  icon?: never;
};

type IconButton = ButtonBase & {
  variant: 'icon';
  icon: keyof typeof ICONS;
  label?: never;
};

type StandardButton = ButtonBase & {
  variant?: 'primary' | 'black';
  label: string;
  icon?: keyof typeof ICONS;
};

export type ButtonConfig = StandardButton | SecondaryButton | IconButton;
