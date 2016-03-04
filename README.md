# eslint-plugin-sort-imports-es6 [![Build Status](https://travis-ci.org/erikdesjardins/eslint-plugin-sort-imports-es6.svg?branch=master)](https://travis-ci.org/erikdesjardins/eslint-plugin-sort-imports-es6)

A sort-imports rule that properly distinguishes between ES6 import types.

ESLint's built-in `sort-imports` rule considers the following to be the same type of import:

```js
import foo from 'foo';
import { bar } from 'bar';
```

This version of the rule fixes that.

It accepts the same options as the [original rule](http://eslint.org/docs/rules/sort-imports), but the `multiple` type corresponds to all named imports (regardless of how many are imported), while the `single` type corresponds only to default imports.

## Usage

`npm i --save-dev eslint-plugin-sort-imports-es6`

```json
{
  "plugins": [
    "sort-imports-es6"
  ],
  "rules": {
    "sort-imports-es6/sort-imports-es6": [2, {
      "ignoreCase": false,
      "ignoreMemberSort": false,
      "memberSyntaxSortOrder": ["none", "all", "multiple", "single"]
    }]
  }
}
```
