import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TndmCodeGolfEditor } from '../code-golf-editor/code-golf-editor';
import { TndmCodeGolfRank } from '../code-golf-rank/code-golf-rank';
import { ButtonConfig, TndmButton } from '../../../../../shared/ui/tndm-button/tndm-button';
import { TndmCodeGolfResults } from '../results-modal/results-modal';
import { CodeGolfService } from '../../services/code-golf.service';


@Component({
  selector: 'tndm-code-golf',
  standalone: true,
  imports: [TndmCodeGolfEditor, TndmCodeGolfRank, TndmButton, TndmCodeGolfResults],
  templateUrl: './code-golf.html',
  styleUrl: './code-golf.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TndmCodeGolf {
  protected readonly service = inject(CodeGolfService);

  // UI state
  protected readonly isProcessing = signal(false);

  // Computed properties
  protected readonly isCodeEmpty = computed(() => 
    this.service.rawCode().trim().length === 0
  );

  protected readonly canCheckSolution = computed(() => 
    !this.isCodeEmpty() && 
    !this.isProcessing() && 
    !!this.service.currentChallenge()
  );

  protected readonly checkBtnConfig = computed((): ButtonConfig => ({
    label: this.isProcessing() ? 'Checking...' : 'Check Solution',
    isDisabled: !this.canCheckSolution(),
    isLoading: this.isProcessing(),
  }));

  protected readonly nextBtnConfig: ButtonConfig = { 
    label: 'Next Challenge',
    variant: 'secondary'
  };

  // Event handlers
  protected async checkSolution(): Promise<void> {
    if (!this.canCheckSolution()) return;

    this.isProcessing.set(true);
    try {
      await this.service.checkSolution();
    } finally {
      this.isProcessing.set(false);
    }
  }

  protected nextChallenge(): void {
    this.service.nextChallenge();
  }

  protected closeResultsModal(): void {
    this.service.hideResults();
  }
}