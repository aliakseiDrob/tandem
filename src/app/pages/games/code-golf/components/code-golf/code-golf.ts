import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { TndmCodeGolfEditor } from '../code-golf-editor/code-golf-editor';
import { TndmCodeGolfRank } from '../code-golf-rank/code-golf-rank';
import { TndmButton } from '../../../../../shared/ui/tndm-button/tndm-button';

import { TndmCodeGolfResults } from '../results-modal/results-modal';

import { CodeGolfService } from '../../services/code-golf.service';

@Component({
  selector: 'tndm-code-golf',
  standalone: true,
  imports: [TndmCodeGolfEditor, TndmCodeGolfRank, TndmButton, TndmCodeGolfResults],
  templateUrl: 'code-golf.html',
  styleUrl: './code-golf.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TndmCodeGolf {
  protected readonly service = inject(CodeGolfService);

  protected readonly isCodeEmpty = computed(() => this.service.rawCode().trim().length === 0);

  protected readonly checkBtnConfig = computed(() => ({
    label: 'Check Solution',
    isDisabled: this.isCodeEmpty(),
  }));

  protected readonly nextBtnConfig = { label: 'Next Challenge' };

  protected check(): void {
    this.service.checkSolution();
  }

  protected next(): void {
    this.service.nextChallenge();
  }

  protected closeModal(): void {
    this.service.showResults.set(false);
  }
}
