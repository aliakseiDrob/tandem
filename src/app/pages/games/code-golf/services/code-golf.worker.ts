/// <reference lib="webworker" />

type TestResult = {
  input: unknown;
  output: unknown;
  expected: unknown;
  passed: boolean;
};

addEventListener('message', ({ data }) => {
  const { code, testCases } = data;
  const results: TestResult[] = [];
  let allPassed = true;

  const userFn = createSafeFunction(code);
  try {
    for (const test of testCases) {
      const args = Array.isArray(test.input) ? test.input : [test.input];
      const output = userFn(...args);
      const passed = JSON.stringify(output) === JSON.stringify(test.expected);
      if (!passed) {
        allPassed = false;
      }
      results.push({ input: test.input, output, expected: test.expected, passed });
    }

    postMessage({ results, allPassed });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown execution error';
    postMessage({ success: false, errorMessage });
  }
});

function createSafeFunction(userCode: string): (...args: unknown[]) => unknown {
  const wrappedCode = `
    "use strict";
    const self = undefined;
    const fetch = undefined;
    return (${userCode});
  `;

  const userFn = new Function(wrappedCode)();

  if (typeof userFn !== 'function') {
    throw new Error('Submitted code is not a valid function.');
  }
  return userFn;
}
