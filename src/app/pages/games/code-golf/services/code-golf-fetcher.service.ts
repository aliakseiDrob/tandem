import { inject, Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { catchError, from, map, Observable, of, retry, timeout } from 'rxjs';

import { Challenge } from '../types/challenge';
import { GolfRank } from '../types/golf-rank';
import { ToastService } from '../../../../core/toast/toast-service';
import { environment } from '../../../../../environments/environment';

interface SupabaseResponse<T> {
  data: T | null;
  error: any;
}

@Injectable({ providedIn: 'root' })
export class CodeGolfFetcherService {
  private readonly supabase: SupabaseClient;
  private readonly toastService = inject(ToastService);
  
  private readonly RPC_FUNCTIONS = {
    GET_RANDOM_CHALLENGE: 'get_random_challenge',
    GET_USER_CHALLENGE_RESULT: 'get_user_golf_result',
    SAVE_CHALLENGE: 'save_golf_result',
    GET_RANKS: 'get_golf_ranks',
  } as const;

  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds
  private readonly RETRY_COUNT = 2;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.key
    );
  }

  getRandomChallenge(lang: 'ru' | 'en' = 'en'): Observable<Challenge | undefined> {
    return from(
      this.supabase.rpc(this.RPC_FUNCTIONS.GET_RANDOM_CHALLENGE, { 
        lang_code: lang 
      })
    ).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(this.RETRY_COUNT),
      map(({ data, error }: SupabaseResponse<Challenge[]>) => {
        if (error) throw error;
        return data?.[0];
      }),
      catchError(error => {
        this.handleFetchError('challenge', error);
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
      timeout(this.REQUEST_TIMEOUT),
      map(({ data, error }: 
SupabaseResponse<number>) => {
        if (error) throw error;
        return data;
      }),
      catchError(error => {
        console.error('Failed to fetch user result:', error);
        return of(null);
      })
    );
  }

  getGolfRanks(): Observable<GolfRank[]> {
    return from(
      this.supabase.rpc(this.RPC_FUNCTIONS.GET_RANKS)
    ).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(this.RETRY_COUNT),
      map(({ data, error }: SupabaseResponse<GolfRank[]>) => {
        if (error) throw error;
        return data ?? [];
      }),
      catchError(error => {
        this.handleFetchError('ranks', error);
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
      timeout(this.REQUEST_TIMEOUT),
      map(({ data, error }: SupabaseResponse<number>) => {
        if (error) throw error;
        return data;
      }),
      catchError(error => {
        console.error('Failed to save result:', error);
        throw error;
      })
    );
  }

  private handleFetchError(resource: string, error: any): void {
    console.error(`Failed to fetch ${resource}:`, error);
    this.toastService.danger(
      'Connection Error',
      `Failed to load ${resource}. Please check your connection and try again.`
    );
  }
}