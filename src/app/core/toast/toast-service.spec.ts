import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast-service';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [ToastService],
    });
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should add a toast and update "shows" signal', () => {
    service.success('success', 'operation complete');

    const currentToasts = service.toasts();

    expect(currentToasts.length).toBe(1);
    expect(currentToasts[0].title).toBe('success');
    expect(service.shows()).toBe(true);
  });

  it('should merge options with defaults', () => {
    service.danger('error', 'critical error', { duration: null });

    const toast = service.toasts()[0];
    expect(toast.options.duration).toBe(null);
    expect(toast.options.icon).toBe(true);
  });

  it('should automatically remove toast after duration', () => {
    service.warning('warning', 'times out', { duration: 3000 });

    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(3000);

    expect(service.toasts().length).toBe(0);
  });

  it('should clear all toasts', () => {
    service.success('1', 'msg');
    service.success('2', 'msg');

    service.removeAll();

    expect(service.toasts().length).toBe(0);
  });
});
