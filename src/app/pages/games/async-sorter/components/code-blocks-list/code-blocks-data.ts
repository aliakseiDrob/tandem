import { taskType } from '../../shared/types';

export type CodeBlockData = {
  code: string;
  taskType: taskType;
  executionOrder: number;
};

export const codeBlocks: CodeBlockData[] = [
  {
    code: `let p = new Promise((resolve, reject) => {
  console.log(2);
  resolve();
});`,

    taskType: 'sync',
    executionOrder: 1,
  },
  {
    code: `console.log(4);`,
    taskType: 'sync',
    executionOrder: 2,
  },
  {
    code: `p
.then(function() {
  console.log(5);
})`,
    taskType: 'micro',
    executionOrder: 3,
  },
  {
    code: `p
.then(function() {
  console.log(7);
})`,
    taskType: 'micro',
    executionOrder: 4,
  },
  {
    code: `.then(function() {
  console.log(6);
});`,
    taskType: 'micro',
    executionOrder: 5,
  },
  {
    code: `.then(function() {
  console.log(8);
});`,
    taskType: 'micro',
    executionOrder: 6,
  },
  {
    code: `setTimeout(function timeout() {
  console.log(1);
}, 0);`,
    taskType: 'macro',
    executionOrder: 7,
  },
];
