import { Token, TokenType } from './types';

const KEYWORDS: Record<string, string> = {
  def: 'Defines a function',
  return: 'Exits function and returns a value',
  if: 'Conditional branch condition',
  else: 'Fallback branch',
  elif: 'Alternative conditional branch',
  while: 'Loop while condition is true',
  for: 'Iterate over sequence',
  in: 'Membership operator in sequence',
  range: 'Generates sequence of numbers',
  print: 'Standard output print function',
  class: 'Defines an object-oriented class blueprint',
  break: 'Exits the innermost loop immediately',
  continue: 'Skips directly to next loop iteration',
  pass: 'Null operation (no-op)',
  self: 'Reference to current instance of class',
  True: 'Boolean truth value (1)',
  False: 'Boolean false value (0)',
  None: 'Null / void reference (0x0)',
  and: 'Logical conjunction',
  or: 'Logical disjunction',
  not: 'Logical negation',
  is: 'Object identity comparison',
  import: 'Imports Python module',
  from: 'Module import source',
  as: 'Namespace alias',
  lambda: 'Anonymous inline function',
};

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let line = 1;
  let col = 1;
  let i = 0;

  while (i < source.length) {
    const char = source[i];

    // Handle newlines
    if (char === '\n') {
      tokens.push({
        type: 'PUNCTUATION',
        value: '\\n',
        line,
        col,
        description: 'Newline: Ends statement in Python',
        category: 'separator',
      });
      line++;
      col = 1;
      i++;
      continue;
    }

    // Skip carriage return and other whitespaces (spaces/tabs)
    if (/\s/.test(char)) {
      col++;
      i++;
      continue;
    }

    // Single-line comment
    if (char === '#') {
      let commentVal = '';
      const startCol = col;
      while (i < source.length && source[i] !== '\n') {
        commentVal += source[i];
        i++;
        col++;
      }
      tokens.push({
        type: 'COMMENT',
        value: commentVal,
        line,
        col: startCol,
        description: 'Comment: Ignored by compiler/interpreter during code generation',
        category: 'literal',
      });
      continue;
    }

    // Number literals (integers, floats, hex)
    if (/[0-9]/.test(char) || (char === '0' && (source[i + 1] === 'x' || source[i + 1] === 'X'))) {
      const startCol = col;
      let numStr = '';
      
      if (char === '0' && (source[i + 1] === 'x' || source[i + 1] === 'X')) {
        numStr += source[i] + source[i + 1];
        i += 2;
        col += 2;
        while (i < source.length && /[0-9a-fA-F]/.test(source[i])) {
          numStr += source[i];
          i++;
          col++;
        }
      } else {
        let hasDot = false;
        while (i < source.length && (/[0-9]/.test(source[i]) || (source[i] === '.' && !hasDot))) {
          if (source[i] === '.') hasDot = true;
          numStr += source[i];
          i++;
          col++;
        }
      }

      tokens.push({
        type: 'NUMBER',
        value: numStr,
        line,
        col: startCol,
        description: `Numeric literal value ${numStr} stored in CPU register/memory`,
        category: 'literal',
      });
      continue;
    }

    // String literals
    if (char === '"' || char === "'") {
      const quote = char;
      const startCol = col;
      let strVal = '';
      i++;
      col++;

      while (i < source.length && source[i] !== quote) {
        if (source[i] === '\\' && i + 1 < source.length) {
          strVal += source[i + 1];
          i += 2;
          col += 2;
        } else {
          strVal += source[i];
          i++;
          col++;
        }
      }

      if (i < source.length && source[i] === quote) {
        i++;
        col++;
      }

      tokens.push({
        type: 'STRING',
        value: `"${strVal}"`,
        line,
        col: startCol,
        description: `String object stored in heap memory: "${strVal}"`,
        category: 'literal',
      });
      continue;
    }

    // Multi-character and single-character operators
    const twoChars = source.slice(i, i + 2);
    if (['==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '//', '**'].includes(twoChars)) {
      tokens.push({
        type: 'OPERATOR',
        value: twoChars,
        line,
        col,
        description: `Operator '${twoChars}' dispatched to CPU Arithmetic Logic Unit (ALU)`,
        category: 'operator',
      });
      i += 2;
      col += 2;
      continue;
    }

    if (['+', '-', '*', '/', '%', '=', '<', '>'].includes(char)) {
      tokens.push({
        type: 'OPERATOR',
        value: char,
        line,
        col,
        description: char === '=' 
          ? 'Assignment operator: Allocates and writes value to memory address' 
          : `Arithmetic/Comparison operator '${char}' processed by CPU ALU`,
        category: 'operator',
      });
      i++;
      col++;
      continue;
    }

    // Punctuation & Delimiters
    if (['(', ')', '[', ']', '{', '}', ':', ',', '.'].includes(char)) {
      const descriptions: Record<string, string> = {
        '(': 'Left parenthesis: Function call / expression grouping',
        ')': 'Right parenthesis: Closes argument list / grouping',
        '[': 'Left bracket: Array / List allocation in heap',
        ']': 'Right bracket: Closes array / index access',
        '{': 'Left brace: Object or dictionary structure',
        '}': 'Right brace: Closes object structure',
        ':': 'Colon: Begins code block (function/loop/condition body)',
        ',': 'Comma: Separates arguments or elements',
        '.': 'Dot: Member / property access on object',
      };

      tokens.push({
        type: 'PUNCTUATION',
        value: char,
        line,
        col,
        description: descriptions[char] || 'Syntax delimiter',
        category: 'separator',
      });
      i++;
      col++;
      continue;
    }

    // Identifiers & Keywords
    if (/[a-zA-Z_]/.test(char)) {
      const startCol = col;
      let ident = '';
      while (i < source.length && /[a-zA-Z0-9_]/.test(source[i])) {
        ident += source[i];
        i++;
        col++;
      }

      if (KEYWORDS[ident]) {
        tokens.push({
          type: 'KEYWORD',
          value: ident,
          line,
          col: startCol,
          description: KEYWORDS[ident],
          category: 'keyword',
        });
      } else {
        tokens.push({
          type: 'IDENTIFIER',
          value: ident,
          line,
          col: startCol,
          description: `Identifier '${ident}': variable, function, or class symbol reference`,
          category: 'identifier',
        });
      }
      continue;
    }

    // Unknown character fallback
    tokens.push({
      type: 'PUNCTUATION',
      value: char,
      line,
      col,
      description: `Symbol '${char}'`,
      category: 'separator',
    });
    i++;
    col++;
  }

  tokens.push({
    type: 'EOF',
    value: '<EOF>',
    line,
    col,
    description: 'End of file token: Lexical analysis completed successfully',
    category: 'separator',
  });

  return tokens;
}
