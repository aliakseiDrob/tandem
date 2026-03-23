import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TndmToaster } from './tndm-toaster';
import { ToastService, ToastType } from '../../../core/toast/toast-service';
import { ElementRef, signal, viewChild } from '@angular/core';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

type MockToastService = {
  toasts: ReturnType<typeof signal<Partial<ToastType>[]>>;
  shows: ReturnType<typeof signal<boolean>>;
  remove: Mock;
  removeAll: Mock;
};

describe('TndmToaster', () => {
  let component: TndmToaster;
  let fixture: ComponentFixture<TndmToaster>;
  let mockToastService: MockToastService;

  beforeEach(async () => {
    mockToastService = {
      toasts: signal([]),
      shows: signal(false),
      remove: vi.fn(),
      removeAll: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [TndmToaster],
      providers: [{ provide: ToastService, useValue: mockToastService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TndmToaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should toggle toast opened ID', () => {
    const mockEvent = { stopPropagation: vi.fn() } as unknown as Event;

    component.toggleToast(mockEvent, 123);
    expect(component['openedToastId']()).toBe(123);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();

    component.toggleToast(mockEvent, 123);
    expect(component['openedToastId']()).toBe(null);
  });

  it('should close opened toast on outside click', () => {
    const mockEvent = { stopPropagation: vi.fn() } as unknown as Event;
    component.toggleToast(mockEvent, 1);
    expect(component['openedToastId']()).toBe(1);

    component.onClickOutside();
    expect(component['openedToastId']()).toBe(null);
  });

  it('should call service remove and reset ID if it was opened', () => {
    const mockEvent = { stopPropagation: vi.fn() } as unknown as Event;
    component.toggleToast(mockEvent, 5);

    component.onRemove(5);

    expect(mockToastService.remove).toHaveBeenCalledWith(5);
    expect(component['openedToastId']()).toBe(null);
  });

  it('should scroll to bottom when toasts change', async () => {
    const mockElement = {
      scrollHeight: 1000,
      scrollTo: vi.fn(),
    } as unknown as HTMLUListElement;

    const mockSignal = vi.fn(() => ({
      nativeElement: mockElement,
    })) as unknown as ReturnType<typeof viewChild<ElementRef<HTMLUListElement>>>;

    vi.spyOn(component as unknown as { scrollContainer: typeof mockSignal }, 'scrollContainer').mockReturnValue(
      mockSignal()
    );

    mockToastService.toasts.set([{ id: 1, title: 'New Toast' }]);

    fixture.detectChanges();

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockElement.scrollTo).toHaveBeenCalledWith({
      top: 1000,
      behavior: 'smooth',
    });
  });

  it('should call removeAll on service', () => {
    component.onRemoveAll();
    expect(mockToastService.removeAll).toHaveBeenCalled();
  });
});
