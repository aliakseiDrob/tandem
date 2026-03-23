import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { GolfRank } from '../../types/golf-rank';

@Component({
  selector: 'tndm-code-golf-rank',
  standalone: true,
  templateUrl: 'code-golf-rank.html',
  styleUrl: './code-golf-rank.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TndmCodeGolfRank {
  readonly rank = input.required<GolfRank>();
  readonly previousBest = input.required<number | null>();
  readonly byteCount = input.required<number>();

  readonly diffInfo = computed(() => {
    const best = this.previousBest();
    const current = this.byteCount();

    if (best === null || current === 0) {
      return null;
    }

    const diff = current - best;

    return {
      value: diff,
      label: diff < 0 ? 'progress' : 'regress',
      isProgress: diff < 0,
      isRegress: diff > 0,
    };
  });
}
