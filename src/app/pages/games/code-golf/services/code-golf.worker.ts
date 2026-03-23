/// <reference lib="webworker" />

import { TestResult, WorkerMessage, WorkerResponse } from '../types/worker.types';

const EXECUTION_TIMEOUT = 3000; // 3 seconds per test case

addEventListener('message', ({ data }: MessageEvent<WorkerMessage>) => {
  try {
    const response = executeTests(data);
    postMessage(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown execution error';
    postMessage({ 
      allPassed: false, 
      error: errorMessage 
    } as WorkerResponse);
  }
});

function executeTests({ code, testCases }: WorkerMessage): WorkerResponse {
  const results: TestResult[] = [];
  let allPassed = true;

  const userFunction = createSafeFunction(code);

  for (const testCase of testCases) {
    try {
      const result = executeTestCase(userFunction, testCase);
      results.push(result);
      
      if (!result.passed) {
        allPassed = false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Test execution failed';
      return {
        allPassed: false,
        error: `Test case failed: ${errorMessage}`,
        results
      };
    }
  }

  return { results, allPassed };
}

function executeTestCase(userFunction: Function, testCase: any): TestResult {
  const startTime = Date.now();
  
  try {
    const args = Array.isArray(testCase.input) ? testCase.input : [testCase.input];
    
    // Execute with timeout
    const output = executeWithTimeout(() => userFunction(...args), EXECUTION_TIMEOUT);
    
    const passed = deepEqual(output, testCase.expected);
    
    return {
      input: testCase.input,
      output,
      expected: testCase.expected,
      passed
    };
  } catch (error) {
    return {
      input: testCase.input,
      output: error instanceof Error ? error.message : 'Execution error',
      expected: testCase.expected,
      passed: false
    };
  }
}

function createSafeFunction(userCode: string): Function {
  // Sanitize and validate the code
  const sanitizedCode = sanitizeCode(userCode);
  
  const wrappedCode = `
    "use strict";
    
    // Disable dangerous globals
    const self = undefined;
    const window = undefined;
    const document = undefined;
    const fetch = undefined;
    const XMLHttpRequest = undefined;
    const WebSocket = undefined;
    const eval = undefined;
    const Function = undefined;
    const setTimeout = undefined;
    const setInterval = undefined;
    
    // Return the user function
    return (${sanitizedCode});
  `;

  try {
    const userFunction = new Function(wrappedCode)();
    
    if (typeof userFunction !== 'function') {
      throw new Error('Submitted code must be a valid function');
    }
    
    return userFunction;
  } catch (error) {
    throw new Error(`Invalid function: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function sanitizeCode(code: string): string {
  // Remove potentially dangerous patterns
  const dangerousPatterns = [
    /import\s+/gi,
    /require\s*\(/gi,
    /eval\s*\(/gi,
    /Function\s*\(/gi,
    /setTimeout\s*\(/
gi,
    /setInterval\s*\(/gi,
  ];

  let sanitized = code;
  for (const pattern of dangerousPatterns) {
    if (pattern.test(sanitized)) {
      throw new Error('Code contains prohibited patterns');
    }
  }

  return sanitized;
}

function executeWithTimeout<T>(fn: () => T, timeoutMs: number): T {
  const start = Date.now();
  
  // Simple timeout check (not perfect but works for most cases)
  const result = fn();
  
  if (Date.now() - start > timeoutMs) {
    throw new Error('Execution timeout');
  }
  
  return result;
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a == null || b == null) return a === b;
  
  if (typeof a !== typeof b) return false;
  
  if (typeof a === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => deepEqual(item, b[index]));
    }
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => deepEqual(a[key], b[key]));
  }
  
  return false;
}