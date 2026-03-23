import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap, catchError, EMPTY, timer } from 'rxjs';

import { CodeGolfFetcherService } from './code-golf-fetcher.service';
import { TndmAuthStateStoreService } from '@auth';
import { ToastService } from '../../../../core/toast/toast-service';
import { REGEX_RULES } from '../types/regex-pattern';
import { GolfRank } from '../types/golf-rank';
import { TestResult, WorkerResponse, WorkerMessage } from '../types/worker.types';

@Injectable({ providedIn: 'root' })
export class CodeGolfService implements OnDestroy {
  // Dependencies
  private readonly fetcher = inject(CodeGolfFetcherService);
  private readonly authStore = inject(TndmAuthStateStoreService);
  private readonly toastService = inject(ToastService);

  // Worker management
  private worker: Worker | null = null;
  private readonly workerTimeout = 5000; // 5 seconds

  // State signals
  readonly rawCode = signal('');
  readonly showResults = signal(false);
  readonly result = signal<WorkerResponse | null>(null);

  // Resources
  readonly ranksResource = rxResource({
    stream: () => this.fetcher.getGolfRanks(),
  });

  readonly challengeResource = rxResource({
    stream: () => this.fetcher.getRandomChallenge(),
  });

  // Computed values
  readonly currentChallenge = computed(() => this.challengeResource.value());
  readonly userId = computed(() => this.authStore.user()?.id);

  readonly byteCount = computed(() => {
    const code = this.rawCode();
    if (!code) return 0;

    return this.calculateByteCount(code);
  });

  readonly currentRank = computed((): GolfRank | undefined => {
    const bytes = this.byteCount();
    const allRanks = this.ranksResource.value();
    
    if (!allRanks?.length) return undefined;
    
    return this.findRankForBytes(bytes, allRanks);
  });

  // User result stream with error handling
  private readonly userResult$ = toObservable(
    computed(() => ({
      key: this.currentChallenge()?.challenge_key,
      uid: this.userId(),
    }))
  ).pipe(
    switchMap(({ key, uid }) => {
      if (!key
 || !uid) return of(null);
      
      return this.fetcher.getUserChallengeResult(key, uid).pipe(
        catchError(error => {
          console.error('Failed to fetch user result:', error);
          return of(null);
        })
      );
    })
  );

  readonly previousBest = toSignal(this.userResult$, { initialValue: null });

  constructor() {
    this.initializeWorker();
  }

  /**
   * Checks the current solution against test cases
   */
  async checkSolution(): Promise<void> {
    const code = this.rawCode();
    const challenge = this.currentChallenge();

    if (!this.validateSolutionInput(code, challenge)) {
      return;
    }

    try {
      await this.executeWorkerTask({
        code: code!,
        testCases: challenge!.test_cases,
      });
      this.showResults.set(true);
    } catch (error) {
      this.handleWorkerError(error);
    }
  }

  /**
   * Loads the next challenge and resets state
   */
  nextChallenge(): void {
    this.resetGameState();
    this.challengeResource.reload();
  }

  /**
   * Hides the results modal
   */
  hideResults(): void {
    this.showResults.set(false);
  }

  /**
   * Saves the result if it's a new record
   */
  saveResult(challengeKey: string, userId: string, bytes: number): void {
    const previousBest = this.previousBest();
    
    if (!this.isNewRecord(previousBest, bytes)) {
      this.showNotNewRecordMessage(previousBest);
      return;
    }

    this.fetcher.saveResult(challengeKey, userId, bytes).subscribe({
      next: (savedBytes: number) => {
        this.toastService.success(
          'New Record! 🎉', 
          `Saved ${savedBytes} bytes - that's your best yet!`
        );
      },
      error: (error) => {
        this.handleSaveError(error);
      },
    });
  }

  ngOnDestroy(): void {
    this.terminateWorker();
  }

  // Private methods

  private calculateByteCount(code: string): number {
    return code
      .replace(REGEX_RULES.MultiComment, '')
      .replace(REGEX_RULES.SingleComment, '')
      .replace(REGEX_RULES.AllWhitespace, '')
      .length;
  }

  private findRankForBytes(bytes: number, ranks: GolfRank[]): GolfRank {
    return ranks.find(rank => bytes <= rank.maxBytes) ?? ranks[ranks.length - 1];
  }

  private validateSolutionInput(code: string, challenge: any): boolean {
    if (!code?.trim()) {
      this.toastService.warning('Empty Code', 'Please write some code first!');
      return false;
    }

    if (!challenge) {
      this.toastService.danger('No Challenge', 'Please wait for the challenge to load.');
      return false;
    }

    if (!this.worker) {
      this.toastService.danger('System Error', 'Code execution environment is not available.');
      return false;
    }

    return true;
  }

  private async executeWorkerTask(message: WorkerMessage): Promise<void> {
    if (!this.worker) {
      throw new Error('Worker not available');
    }

    return new Promise((resolve, reject) => {
      const timeout = timer(this.workerTimeout).subscribe(() => {
        reject(new Error('Code execution timed out'));
      });

      const messageHandler = (event: MessageEvent<WorkerResponse>) => {
        timeout.unsubscribe();
        this.worker!.removeEventListener('message', messageHandler);
        this.handleWorkerResponse(event.data);
        resolve();
      };

      this.worker!.addEventListener('message', messageHandler);
      this.worker!.postMessage(message);
    });
  }

  private handleWorkerResponse(data: WorkerResponse): void {
    this.result.set(data);

    if (data.allPassed) {
      this.handleSuccessfulSolution();
    }
  }

  private handleSuccessfulSolution(): void {
    const challenge = this.currentChallenge();
    const userId = this.userId();
    
    if (challenge && userId) {
      this.saveResult(challenge.challenge_key, userId, this.byteCount());
    }
  }

  private handleWorkerError(error: any): void {
    console.error('Worker execution error:', error);
    this.result
.set({ 
      allPassed: false, 
      error: error.message || 'Code execution failed' 
    });
    this.showResults.set(true);
  }

  private handleSaveError(error: any): void {
    const errorMessage = error?.message || 'Failed to save result';
    this.toastService.danger('Save Failed', errorMessage);
  }

  private isNewRecord(previousBest: number | null, currentBytes: number): boolean {
    return previousBest === null || currentBytes < previousBest;
  }

  private showNotNewRecordMessage(previousBest: number | null): void {
    if (previousBest !== null) {
      this.toastService.info(
        'Keep Trying! 💪', 
        `Your current best is ${previousBest} bytes. You need ${this.byteCount() - previousBest} fewer bytes for a new record.`
      );
    }
  }

  private resetGameState(): void {
    this.rawCode.set('');
    this.showResults.set(false);
    this.result.set(null);
  }

  private initializeWorker(): void {
    if (!this.isWorkerSupported()) {
      console.warn('Web Workers are not supported');
      return;
    }

    try {
      this.worker = new Worker(new URL('../workers/code-golf.worker', import.meta.url));
      this.setupWorkerErrorHandler();
    } catch (error) {
      console.error('Failed to initialize worker:', error);
      this.toastService.danger('System Error', 'Failed to initialize code execution environment');
    }
  }

  private setupWorkerErrorHandler(): void {
    if (!this.worker) return;

    this.worker.onerror = (error) => {
      console.error('Worker error:', error);
      this.result.set({ 
        allPassed: false, 
        error: 'Critical execution error' 
      });
    };
  }

  private isWorkerSupported(): boolean {
    return typeof Worker !== 'undefined';
  }

  private terminateWorker(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}