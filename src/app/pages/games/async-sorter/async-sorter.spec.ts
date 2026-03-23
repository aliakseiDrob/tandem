import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TndmAsyncSorter } from './async-sorter';
import { TndmCodeBlocksList } from './components/code-blocks-list/code-blocks-list';
import { TndmTaskBucketsList } from './components/task-buckets-list/task-buckets-list';
import { TndmFinalCallStack } from './components/final-call-stack/final-call-stack';
import { CodeBlockData } from './components/code-blocks-list/code-blocks-data';

describe('TndmAsyncSorter', () => {
  let component: TndmAsyncSorter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TndmAsyncSorter],
    }).compileComponents();

    const fixture = TestBed.createComponent(TndmAsyncSorter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders child components and passes initial buckets', () => {
    const fixture = TestBed.createComponent(TndmAsyncSorter);
    fixture.detectChanges();

    const codeBlocksList = fixture.debugElement.query(By.directive(TndmCodeBlocksList));
    const bucketsList = fixture.debugElement.query(By.directive(TndmTaskBucketsList));
    const finalStack = fixture.debugElement.query(By.directive(TndmFinalCallStack));

    expect(codeBlocksList).toBeTruthy();
    expect(bucketsList).toBeTruthy();
    expect(finalStack).toBeTruthy();

    const bucketsInstance = bucketsList.componentInstance as TndmTaskBucketsList;
    expect(bucketsInstance.syncBucket()).toEqual([]);
    expect(bucketsInstance.microBucket()).toEqual([]);
    expect(bucketsInstance.macroBucket()).toEqual([]);
  });

  it('runLoop sorts blocks by executionOrder and calls animateBlocks', () => {
    const sync: CodeBlockData[] = [
      { code: 'sync-2', taskType: 'sync', executionOrder: 2 },
      { code: 'sync-1', taskType: 'sync', executionOrder: 1 },
    ];
    const micro: CodeBlockData[] = [
      { code: 'micro-4', taskType: 'micro', executionOrder: 4 },
      { code: 'micro-3', taskType: 'micro', executionOrder: 3 },
    ];
    const macro: CodeBlockData[] = [
      { code: 'macro-6', taskType: 'macro', executionOrder: 6 },
      { code: 'macro-5', taskType: 'macro', executionOrder: 5 },
    ];

    component.syncBucket.set(sync);
    component.microBucket.set(micro);
    component.macroBucket.set(macro);

    const sorterWithAnimate = component as unknown as {
      animateBlocks(queue: CodeBlockData[]): void;
    };
    const animateSpy = vi.spyOn(sorterWithAnimate, 'animateBlocks') as unknown as MockInstance<
      (queue: CodeBlockData[]) => void
    >;

    component.runLoop();

    expect(animateSpy).toHaveBeenCalledTimes(1);
    const [queue] = animateSpy.mock.calls[0];

    const orders = queue.map((b: CodeBlockData) => b.executionOrder);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6]);

    expect(queue[0].taskType).toBe('sync');
    expect(queue[1].taskType).toBe('sync');
    expect(queue[2].taskType).toBe('micro');
    expect(queue[3].taskType).toBe('micro');
    expect(queue[4].taskType).toBe('macro');
    expect(queue[5].taskType).toBe('macro');
  });

  it('runLoop does nothing when all buckets are empty', () => {
    component.syncBucket.set([]);
    component.microBucket.set([]);
    component.macroBucket.set([]);

    const sorterWithAnimate = component as unknown as {
      animateBlocks(queue: CodeBlockData[]): void;
    };
    const animateSpy = vi.spyOn(sorterWithAnimate, 'animateBlocks');

    component.runLoop();

    expect(animateSpy).not.toHaveBeenCalled();
  });

  it('animateBlocks moves blocks from bucket to finalCallStack', async () => {
    vi.useFakeTimers();

    const block: CodeBlockData = {
      code: 'console.log(1);',
      taskType: 'sync',
      executionOrder: 1,
    };
    component.syncBucket.set([block]);
    component.microBucket.set([]);
    component.macroBucket.set([]);

    const fakeElement = document.createElement('div');
    const fakeRect = {
      left: 0,
      top: 0,
      right: 100,
      bottom: 20,
      width: 100,
      height: 20,
    } as DOMRect;

    const rectSpy = vi.spyOn(fakeElement, 'getBoundingClientRect').mockReturnValue(fakeRect);
    const querySpy = vi.spyOn(document, 'querySelector').mockReturnValue(fakeElement);

    const sorterWithAnimate = component as unknown as {
      animateBlocks(queue: CodeBlockData[]): void;
    };
    sorterWithAnimate.animateBlocks([block]);

    vi.runAllTimers();

    rectSpy.mockRestore();
    querySpy.mockRestore();

    expect(component.syncBucket()).toEqual([]);
    expect(component.finalCallStack()).toEqual([block]);

    vi.useRealTimers();
  });

  it('final call stack hides items that are marked as invisible', () => {
    const fixture = TestBed.createComponent(TndmFinalCallStack);

    const blocks: CodeBlockData[] = [
      { code: '1', taskType: 'sync', executionOrder: 1 },
      { code: '2', taskType: 'sync', executionOrder: 2 },
    ];

    fixture.componentRef.setInput('codeBlocks', blocks);
    fixture.componentRef.setInput('invisibleCodeBlocks', [blocks[1]]);

    fixture.detectChanges();

    const lis = fixture.nativeElement.querySelectorAll('li.list-item') as HTMLLIElement[];

    expect(lis[0].classList.contains('is-hidden')).toBe(false);
    expect(lis[1].classList.contains('is-hidden')).toBe(true);
  });
});
