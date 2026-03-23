import { inject, Injectable } from '@angular/core';
import { Challenge } from '../types/challenge';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GolfRank } from '../types/golf-rank';
import { catchError, from, map, Observable, of } from 'rxjs';
import { ToastService } from '../../../../core/toast/toast-service';

@Injectable({ providedIn: 'root' })
export class CodeGolfFetcherService {
  private readonly supabaseUrl = 'https://bqfoaeuuwilliipmpovu.supabase.co';
  private readonly supabaseKey = 'sb_publishable_KXv3jOLT3TQj-ZqMbjPwLg_o8unxvBW';
  private readonly RPC_FUNCTIONS = {
    GET_RANDOM_CHALLENGE: 'get_random_challenge',
    GET_USER_CHALLENGE_RESULT: 'get_user_golf_result',
    SAVE_CHALLENGE: 'save_golf_result',
    GET_RANKS: 'get_golf_ranks',
  } as const;
  private readonly toastService = inject(ToastService);

  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  getRandomChallenge(lang: 'ru' | 'en' = 'en'): Observable<Challenge | undefined> {
    return from(this.supabase.rpc(this.RPC_FUNCTIONS.GET_RANDOM_CHALLENGE, { lang_code: lang })).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data?.[0];
      }),
      catchError(() => {
        this.toastService.danger('Oops, something went wrong!', `Please refresh the page or try again later.`);
        return of(undefined);
      })
    );
  }

  getUserChallengeResult(challengeKey: string, userId: string): Observable<number | null> {
    if (!challengeKey || !userId) {
      return of(null);
    }
    return from(
      this.supabase.rpc(this.RPC_FUNCTIONS.GET_USER_CHALLENGE_RESULT, {
        challengekey: challengeKey,
        userid: userId,
      })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data ? data : null;
      }),
      catchError(() => of(null))
    );
  }

  getGolfRanks(): Observable<GolfRank[]> {
    return from(this.supabase.rpc(this.RPC_FUNCTIONS.GET_RANKS)).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data ?? [];
      }),
      catchError(() => {
        this.toastService.danger('Oops, something went wrong!', `Please refresh the page or try again later.`);
        return of([]);
      })
    );
  }

  saveResult(challengeKey: string, userId: string, bytes: number): Observable<number> {
    return from(
      this.supabase.rpc(this.RPC_FUNCTIONS.SAVE_CHALLENGE, {
        p_challenge_key: challengeKey,
        p_user_id: userId,
        p_byte_count: bytes,
      })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data;
      }),
      catchError(error => {
        this.toastService.danger('Error saving result', error.message);
        throw error;
      })
    );
  }
}
