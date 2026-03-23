import { Component, input } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { CodeBlockData } from '../code-blocks-list/code-blocks-data';
import { TndmCodeBlock } from '../code-block/code-block';

@Component({
  selector: 'ul[tndm-final-call-stack]',
  templateUrl: './final-call-stack.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './final-call-stack.scss',
  imports: [TndmCodeBlock],
})
export class TndmFinalCallStack {
  readonly codeBlocks = input.required<CodeBlockData[]>();
  readonly invisibleCodeBlocks = input.required<CodeBlockData[]>();
}
