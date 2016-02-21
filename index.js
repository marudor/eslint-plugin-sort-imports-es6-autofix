/**
 * @fileoverview A sort-imports rule that properly distinguishes between ES6 import types.
 * @author Nicholas C. Zakas
 * @author Erik Desjardins
 */
'use strict';

module.exports = {
	rules: {
		'sort-imports-es6': require('./rules/sort-imports-es6')
	}
};
