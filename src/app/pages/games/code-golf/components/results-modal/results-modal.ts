import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TndmButton } from '../../../../../shared/ui/tndm-button/tndm-button';
import { WorkerResponse } from '../../services/code-golf.service';

@Component({
  selector: 'tndm-code-golf-results',
  standalone: true,
  imports: [TndmButton],
  templateUrl: './results-modal.html',
  styleUrl: './results-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TndmCodeGolfResults {
  readonly result = input.required<WorkerResponse>();
  readonly closeModal = output<void>();

  protected readonly okBtnConfig = { label: 'Ok' };
}
