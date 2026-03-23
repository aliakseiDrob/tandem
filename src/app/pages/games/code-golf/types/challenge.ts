export type Challenge = {
  challenge_key: string;
  title: string;
  description: string;
  test_cases: TestCase[];
};

export type TestCase = {
  input: unknown;
  expected: unknown;
};
