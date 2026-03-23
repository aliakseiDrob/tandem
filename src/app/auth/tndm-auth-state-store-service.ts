import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { SupabaseService } from '../core/supabase/supabase-service';
import { Session, SupabaseClient, User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class TndmAuthStateStoreService {
  private readonly supabaseService: SupabaseService = inject(SupabaseService);
  private readonly supabase: SupabaseClient = this.supabaseService.client;

  readonly session: WritableSignal<Session | null> = signal<Session | null>(null);
  readonly isAuthenticated: Signal<boolean> = computed((): boolean => !!this.jwt());
  readonly user: Signal<User | null> = computed((): User | null => this.session()?.user ?? null);
  readonly jwt: Signal<string | null> = computed((): string | null => this.session()?.access_token ?? null);

  private initialized = false;

  constructor() {
    this.supabase.auth.onAuthStateChange((_, session: Session | null): void => {
      this.session.set(session ?? null);
    });
  }

  async initSession(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const {
      data: { session },
    } = await this.supabase.auth.getSession();

    this.session.set(session ?? null);
    this.initialized = true;
  }
}
