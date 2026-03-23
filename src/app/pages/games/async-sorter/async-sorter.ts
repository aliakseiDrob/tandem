import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { TndmButton } from '../../../shared/ui/tndm-button/tndm-button';
import { TndmCodeBlocksList } from './components/code-blocks-list/code-blocks-list';
import { TndmTaskBucketsList } from './components/task-buckets-list/task-buckets-list';
import { TndmFinalCallStack } from './components/final-call-stack/final-call-stack';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { CodeBlockData } from './components/code-blocks-list/code-blocks-data';
import { taskType } from './shared/types';

@Component({
  selector: 'tndm-async-sorter',
  templateUrl: 'async-sorter.html',
  styleUrl: 'async-sorter.scss',
  imports: [TndmButton, TndmCodeBlocksList, TndmTaskBucketsList, TndmFinalCallStack, CdkDropListGroup],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TndmAsyncSorter {
  readonly syncBucket = signal<CodeBlockData[]>([]);
  readonly microBucket = signal<CodeBlockData[]>([]);
  readonly macroBucket = signal<CodeBlockData[]>([]);

  readonly finalCallStack = signal<CodeBlockData[]>([]);
  readonly invisibleCodeBlocks = signal<CodeBlockData[]>([]);

  private getBucketByType(type: taskType): WritableSignal<CodeBlockData[]> {
    switch (type) {
      case 'sync':
        return this.syncBucket;
      case 'micro':
        return this.microBucket;
      case 'macro':
        return this.macroBucket;
      default:
        throw new Error(
          'taskType of current block that is being moved from its bucket to final call stack is not recognized '
        );
    }
  }

  runLoop(): void {
    const animationQueue = [...this.syncBucket(), ...this.microBucket(), ...this.macroBucket()].sort(
      (a, b) => a.executionOrder - b.executionOrder
    );

    if (!animationQueue.length) {
      return;
    }

    this.animateBlocks(animationQueue);
  }

  private animateBlocks(queue: CodeBlockData[]): void {
    let currentIndex = 0;

    const moveBlock = (): void => {
      if (currentIndex >= queue.length) {
        return;
      }

      const currentMovingBlock = queue[currentIndex];

      const oldElement = document.querySelector(`[data-execution-order="${currentMovingBlock.executionOrder}"]`);
      const oldRect = oldElement?.getBoundingClientRect();
      if (!oldRect) {
        return;
      }

      // Delete current moving block from its bucket
      const bucket = this.getBucketByType(currentMovingBlock.taskType);
      bucket.update(items => items.filter(i => i.executionOrder !== currentMovingBlock.executionOrder));

      // Add the removed block to finalCallStack and to list of invisible blocks
      this.invisibleCodeBlocks.update(items => [...items, currentMovingBlock]);
      this.finalCallStack.update(items => [...items, currentMovingBlock]);

      requestAnimationFrame(() => {
        const duration = 1000;

        const newElement = document.querySelector(`[data-execution-order="${currentMovingBlock.executionOrder}"]`);
        if (!(newElement instanceof HTMLElement)) {
          return;
        }

        const newRect = newElement.getBoundingClientRect();

        const deltaX = oldRect.left - newRect.left;
        const deltaY = oldRect.top - newRect.top;

        newElement.style.transition = 'none';
        newElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        requestAnimationFrame(() => {
          // Delete block from the list of invisible blocks
          this.invisibleCodeBlocks.update(items =>
            items.filter(item => item.executionOrder !== currentMovingBlock.executionOrder)
          );

          newElement.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.8, 0.25, 1)`;
          newElement.style.transform = 'translate(0, 0)';

          setTimeout(() => {
            newElement.style.transition = '';
            newElement.style.transform = '';
          }, duration);
        });

        currentIndex++;
        setTimeout(moveBlock, duration);
      });
    };

    moveBlock();
  }
}
