import _ from 'lodash';
const esprima = require('esprima');
const OPEN_BRACKETS = [ '(', '{', '[', '`' ];
const CLOSE_BRACKETS = [ ')', '}', ']', '`' ];
const BRACKETS_MAP = {
  ')': '(',
  '}': '{',
  ']': '[',
  '`': '`'
};

const findBrackets = (column, lineContents) => 
    _.intersection(_.takeRight(lineContents, lineContents.length - column), OPEN_BRACKETS).length

export const parseCode = code => {
  const codeByLine = code.split('\n');
  const tokenized = esprima.tokenize(code, { loc: true });
  const brackets = { '(': 0, '{': 0, '[': 0 };
  let wasOpen = false;

  const parsed = _.reduce(tokenized, (expressions, { value, loc }) => {
    const lineNumber = loc.end.line;
    const lineContents = codeByLine[lineNumber - 1];
    const lineHasMoreDelimiters = findBrackets(loc.end.column, lineContents);

    if (expressions[lineNumber]) { return expressions; }

    if (OPEN_BRACKETS.includes(value)) {
      brackets[value] += 1;
      wasOpen = true;
    }

    if (CLOSE_BRACKETS.includes(value)) {
      brackets[BRACKETS_MAP[value]] -= 1;
    }

    if (!lineHasMoreDelimiters && wasOpen && _.every(brackets, count => count === 0)) {
      wasOpen = false;
      expressions[lineNumber] = _.take(codeByLine, lineNumber).join('\n');

      return expressions;
    }

    if (!lineHasMoreDelimiters && _.every(brackets, count => count === 0)) {
      expressions[lineNumber] = _.take(codeByLine, lineNumber).join('\n');

      return expressions;
    }

    return expressions;
  }, {});

  eval(code);
  return parsed;
}