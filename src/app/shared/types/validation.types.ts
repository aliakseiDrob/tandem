export type ErrorGenerator<T = unknown> = (name: string, context: T) => string;

export type ValidationMessages<T = unknown> = {
  [key: string]: ErrorGenerator<T> | string | undefined;
};
