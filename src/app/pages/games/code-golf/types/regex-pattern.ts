export const REGEX_RULES: Record<regexName, RegExp> = {
  MultiComment: /\/\*[\s\S]*?\*\//g,
  SingleComment: /\/\/.*/g,
  AllWhitespace: /\s+/g,
};

type regexName = 'MultiComment' | 'SingleComment' | 'AllWhitespace';
