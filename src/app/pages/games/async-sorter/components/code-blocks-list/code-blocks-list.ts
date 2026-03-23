import { Component } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { TndmCodeBlock } from '../code-block/code-block';
import { codeBlocks } from './code-blocks-data';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';

@Component({
  selector: 'tndm-code-blocks-list',
  templateUrl: './code-blocks-list.html',
  styleUrl: './code-blocks-list.scss',
  imports: [CdkDropList, TndmCodeBlock, CdkDrag],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TndmCodeBlocksList {
  readonly codeBlocks = codeBlocks;

  noReturnPredicate(): false {
    return false;
  }
}
