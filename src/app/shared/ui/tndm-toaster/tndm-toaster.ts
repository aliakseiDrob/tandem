import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ButtonConfig, TndmButton } from '../tndm-button/tndm-button';
import { ToastService } from '../../../core/toast/toast-service';
import { SvgIconComponent } from 'angular-svg-icon';
import { ICONS } from '../../constants/icons.constant';

@Component({
  selector: 'tndm-toaster',
  imports: [TndmButton, SvgIconComponent],
  templateUrl: './tndm-toaster.html',
  styleUrl: './tndm-toaster.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TndmToaster {
  protected readonly toast = inject(ToastService);
  protected readonly ICONS = ICONS;
  protected readonly closeBtnConfig: ButtonConfig = { icon: 'close', size: 'sm', variant: 'icon' };
  protected readonly closeAllBtnConfig: ButtonConfig = {
    label: 'clear',
    size: 'md',
    variant: 'black',
  };
  protected readonly openedToastId = signal<number | null>(null);

  private readonly scrollContainer = viewChild<ElementRef<HTMLUListElement>>('scrollContainer');

  constructor() {
    effect(() => {
      this.toast.toasts();
      const el = this.scrollContainer()?.nativeElement;

      if (el) {
        setTimeout(() => {
          el.scrollTo({
            top: el.scrollHeight,
            behavior: 'smooth',
          });
        });
      }
    });
  }

  toggleToast(event: Event, id: number): void {
    event.stopPropagation();
    this.openedToastId.update(currentId => (currentId === id ? null : id));
  }

  @HostListener('document:click')
  onClickOutside(): void {
    this.openedToastId.set(null);
  }

  onRemove(id: number): void {
    if (this.openedToastId() === id) {
      this.openedToastId.set(null);
    }
    this.toast.remove(id);
  }

  onRemoveAll(): void {
    this.toast.removeAll();
  }
}
