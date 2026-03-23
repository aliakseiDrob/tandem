import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { CodeGolfFetcherService } from './code-golf-fetcher.service';
import { TndmAuthStateStoreService } from '@auth';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { REGEX_RULES } from '../types/regex-pattern';
import { GolfRank } from '../types/golf-rank';
import { of, switchMap } from 'rxjs';
import { ToastService } from '../../../../core/toast/toast-service';

export type TestResult = {
  input: unknown;
  output: unknown;
  expected: unknown;
  passed: boolean;
};

export type WorkerResponse = {
  allPassed: boolean;
  results?: TestResult[];
  error?: string;
};

@Injectable({ providedIn: 'root' })
export class CodeGolfService implements OnDestroy {
  private readonly fetcher = inject(CodeGolfFetcherService);
  private readonly authStore = inject(TndmAuthStateStoreService);
  private readonly toastService = inject(ToastService);

  private worker: Worker | undefined;

  readonly rawCode = signal('');
  readonly showResults = signal(false);
  readonly result = signal<WorkerResponse | null>(null);

  readonly ranksResource = rxResource({
    stream: () => this.fetcher.getGolfRanks(),
  });

  readonly challengeResource = rxResource({
    stream: () => this.fetcher.getRandomChallenge(),
  });

  private readonly userResult = toObservable(
    computed(() => ({
      key: this.currentChallenge()?.challenge_key,
      uid: this.userId(),
    }))
  ).pipe(
    switchMap(({ key, uid }) => {
      if (!key || !uid) {
        return of(null);
      }
      return this.fetcher.getUserChallengeResult(key, uid);
    })
  );

  readonly previousBest = toSignal(this.userResult, { initialValue: null });

  readonly currentChallenge = computed(() => this.challengeResource.value());
  readonly userId = computed(() => this.authStore.user()?.id);

  readonly byteCount = computed(() => {
    const code = this.rawCode();
    if (!code) {
      return 0;
    }
    return code
      .replace(REGEX_RULES.MultiComment, '')
      .replace(REGEX_RULES.SingleComment, '')
      .replace(REGEX_RULES.AllWhitespace, '').length;
  });

  readonly currentRank = computed((): GolfRank => {
    const bytes = this.byteCount();
    const allRanks = this.ranksResource.value() ?? [];
    return allRanks.find(rank => bytes <= rank.maxBytes) || allRanks[allRanks.length - 1];
  });

  constructor() {
    this.initWorker();
  }

  checkSolution(): void {
    const code = this.rawCode();
    const challenge = this.currentChallenge();

    if (code && challenge && this.worker) {
      this.worker.postMessage({ code, testCases: challenge.test_cases });
      this.showResults.set(true);
    }
  }

  nextChallenge(): void {
    this.rawCode.set('');
    this.showResults.set(false);
    this.result.set(null);
    this.challengeResource.reload();
  }

  saveResult(challengeKey: string, userId: string, bytes: number): void {
    const previousBest = this.previousBest();
    const isNewRecord = previousBest === null || bytes < previousBest;

    if (!isNewRecord) {
      this.toastService.info('Keep trying!', `Your current best is ${previousBest} bytes.`);
      return;
    }

    this.fetcher.saveResult(challengeKey, userId, bytes).subscribe({
      next: (savedBytes: number) => {
        this.toastService.success('New Record!', `Result of ${savedBytes} bytes saved successfully.`);
      },
      error: err => {
        const errorMessage = err?.message || 'Unknown database error';
        this.toastService.danger('Save failed', errorMessage);
      },
    });
  }

  private initWorker(): void {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('./code-golf.worker', import.meta.url));

      this.worker.onmessage = ({ data }: MessageEvent<WorkerResponse>): void => {
        this.result.set(data);

        const challenge = this.currentChallenge();
        const userId = this.userId();
        if (data.allPassed && challenge && userId) {
          this.saveResult(challenge.challenge_key, userId, this.byteCount());
        }
      };

      this.worker.onerror = (): void => {
        this.result.set({ allPassed: false, error: 'Critical Worker Error' });
      };
    }
  }

  ngOnDestroy(): void {
    this.worker?.terminate();
  }
}
