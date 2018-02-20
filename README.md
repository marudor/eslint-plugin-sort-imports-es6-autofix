# eslint-plugin-sort-imports-es6-autofix

A sort-imports rule that properly distinguishes between ES6 import types and that is also able to autofix all detected problems.

ESLint's built-in `sort-imports` rule considers the following to be the same type of import:

```js
import foo from 'foo';
import { bar } from 'bar';
```

This version of the rule fixes that.

It accepts the same options as the [original rule](http://eslint.org/docs/rules/sort-imports), but the `multiple` type corresponds to all named imports (regardless of how many are imported), while the `single` type corresponds only to default imports.

This rule respects whitespace and comments between imports by only looking at the order of (and sorting) consecutive import statements (those without newlines/comments in between them).

This fork also fixes the import order on eslint --fix.
To avoid problems, it will only switch out the import statements, not comments on the same line, etc.

ESLint's built-in `sort-imports` is only able to sort variable names inside of `multiple`-imports.

## Usage

`npm i --save-dev eslint-plugin-sort-imports-es6-autofix`

```json
{
  "plugins": [
    "sort-imports-es6-autofix"
  ],
  "rules": {
    "sort-imports-es6-autofix/sort-imports-es6": [2, {
      "ignoreCase": false,
      "ignoreMemberSort": false,
      "memberSyntaxSortOrder": ["none", "all", "multiple", "single"]
    }]
  }
}
```
