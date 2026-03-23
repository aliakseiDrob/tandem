import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { GolfRank } from '../../types/golf-rank';

interface DiffInfo {
  value: number;
  label: string;
  isProgress: boolean;
  isRegress: boolean;
  displayValue: string;
}

@Component({
  selector: 'tndm-code-golf-rank',
  standalone: true,
  imports: [DecimalPipe, NgClass],
  templateUrl: './code-golf-rank.html',
  styleUrl: './code-golf-rank.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TndmCodeGolfRank {
  readonly rank = input.required<GolfRank | undefined>();
  readonly previousBest = input.required<number | null>();
  readonly byteCount = input.required<number>();

  readonly diffInfo = computed((): DiffInfo | null => {
    const best = this.previousBest();
    const current = this.byteCount();

    if (best === null || current === 0) {
      return null;
    }

    const diff = current - best;
    const absValue = Math.abs(diff);

    return {
      value: diff,
      label: diff < 0 ? 'improvement' : diff > 0 ? 'regression' : 'same',
      isProgress: diff < 0,
      isRegress: diff > 0,
      displayValue: diff === 0 ? 'Same' : `${diff > 0 ? '+' : ''}${diff}`,
    };
  });

  readonly progressPercentage = computed((): number => {
    const currentRank = this.rank();
    if (!currentRank) return 0;

    const bytes = this.byteCount();
    const maxBytes = currentRank.maxBytes;
    
    // Calculate progress within the current rank
    return Math.min((bytes / maxBytes) * 100, 100);
  });

  readonly isNewRecord = computed((): boolean => {
    const diff = this.diffInfo();
    return diff?.isProgress ?? false;
  });
}