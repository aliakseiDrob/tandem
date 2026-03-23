import { Component, input, output } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { TndmTaskBucket } from '../task-bucket/task-bucket';
import { CodeBlockData } from '../code-blocks-list/code-blocks-data';

@Component({
  selector: 'tndm-task-bucket-list',
  imports: [TndmTaskBucket],
  templateUrl: './task-buckets-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './task-buckets-list.scss',
})
export class TndmTaskBucketsList {
  readonly syncBucket = input.required<CodeBlockData[]>();
  readonly microBucket = input.required<CodeBlockData[]>();
  readonly macroBucket = input.required<CodeBlockData[]>();

  readonly syncBucketChanged = output<CodeBlockData[]>();
  readonly microBucketChanged = output<CodeBlockData[]>();
  readonly macroBucketChanged = output<CodeBlockData[]>();
}
