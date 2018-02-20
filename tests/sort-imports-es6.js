/**
 * @fileoverview Tests for sort-imports rule.
 * @author Christian Schuller
 * @copyright 2015 Christian Schuller. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../rules/sort-imports-es6");
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------


var expectedError = {
    message: "Imports should be sorted alphabetically.",
    type: "ImportDeclaration"
};
var ignoreCaseArgs = [{ignoreCase: true}];
const fixtures = {
    valid: [
        {
            code:
            "import a from 'foo.js';\n" +
            "import b from 'bar.js';\n" +
            "import c from 'baz.js';\n",
        },
        {
            code:
            "import * as B from 'foo.js';\n" +
            "import A from 'bar.js';",
        },
        {
            code:
            "import * as B from 'foo.js';\n" +
            "import {a, b} from 'bar.js';",
          },
        {
            code:
            "import {b, c} from 'bar.js';\n" +
            "import A from 'foo.js';",
        },
        {
            code:
            "import A from 'bar.js';\n" +
            "import {b, c} from 'foo.js';",
            options: [{
                memberSyntaxSortOrder: [ "single", "multiple", "none", "all" ]
            }]
        },
        {
            code:
            "import {a, b} from 'bar.js';\n" +
            "import {c} from 'foo.js';",
        },
        {
            code:
            "import A from 'foo.js';\n" +
            "import B from 'bar.js';",
        },
        {
            code:
            "import A from 'foo.js';\n" +
            "import a from 'bar.js';",
        },
        {
            code:
            "import a, * as B from 'foo.js';\n" +
            "import b from 'bar.js';",
        },
        {
            code:
            "import 'foo.js';\n" +
            " import a from 'bar.js';",
        },
        {
            code:
            "import B from 'foo.js';\n" +
            "import a from 'bar.js';",
        },
        {
            code:
            "import a from 'foo.js';\n" +
            "import B from 'bar.js';",
            options: ignoreCaseArgs
        },
        {
            code: "import {a, b, c, d} from 'foo.js';",
        },
        {
            code: "import {b, A, C, d} from 'foo.js';",
            options: [{
                ignoreMemberSort: true
            }]
        },
        {
            code: "import {B, a, C, d} from 'foo.js';",
            options: [{
                ignoreMemberSort: true
            }]
        },
        {
            code: "import {a, B, c, D} from 'foo.js';",
            options: ignoreCaseArgs
        },
        {
            code: "import a, * as b from 'foo.js';",
        },
        {
            code:
            "import * as a from 'foo.js';\n" +
            "\n" +
            "import b from 'bar.js';",
        },
        {
            code:
            "import * as bar from 'bar.js';\n" +
            "import * as foo from 'foo.js';",
        },

        // https://github.com/eslint/eslint/issues/5130
        {
            code:
            "import 'foo';\n" +
            "import bar from 'bar';",
            options: ignoreCaseArgs
        },

        // https://github.com/eslint/eslint/issues/5305
        {
            code: "import React, {Component} from 'react';",
        },

        // ensure that a single named import is treated differently from a default import
        {
            code:
            "import {foo} from 'foo';\n" +
            "import bar from 'bar';",
        },
        // ensure that typed imports are in the right place and options are evaluated.
        {
            code:
            "import bar from 'bar'; \n" +
            "import foo from 'foo';\n" +
            "import type baz from 'baz';",
            parser: 'babel-eslint',
        },
        {
            code:
            "import type foo from 'foo';\n" +
            "import bar from 'bar'; \n" +
            "import baz from 'baz';",
            options: [{typeSortStrategy: "before"}],
            parser: 'babel-eslint',
        },
        {
            code:
            "import bar from 'bar'; \n" +
            "import type baz from 'baz';\n" +
            "import foo from 'foo';",
            options: [{typeSortStrategy: "mixed"}],
            parser: 'babel-eslint',
        },

        // ensure that only consecutive (no lines inbetween) imports are sorted
        {
            code:
            "import B from 'foo.js';\n" +
            "\n" +
            "import A from 'baz.js';",
        },
        {
            code:
            "import B from 'foo.js';\n" +
            "// comment\n" +
            "import A from 'baz.js';",
        },
        {
            code:
            "import B from 'foo.js';\n" +
            "B.something()\n" +
            "import A from 'baz.js';",
        },
    ],
    invalid: [
        {
            code:
            "import a from 'foo.js';\n" +
            "import A from 'bar.js';",
            output:
            "import A from 'bar.js';\n" +
            "import a from 'foo.js';",
            errors: [expectedError],
        },
        {
            code:
            "import b from 'foo.js';\n" +
            "import a from 'bar.js';",
            output:
            "import a from 'bar.js';\n" +
            "import b from 'foo.js';",
            errors: [expectedError]
        },
        {
            code:
            "import {b, c} from 'foo.js';\n" +
            "import {a, d} from 'bar.js';",
            output:
            "import {a, d} from 'bar.js';\n" +
            "import {b, c} from 'foo.js';",
            errors: [expectedError]
        },
        {
            code:
            "import * as foo from 'foo.js';\n" +
            "import * as bar from 'bar.js';",
            output:
            "import * as bar from 'bar.js';\n" +
            "import * as foo from 'foo.js';",
            errors: [expectedError]
        },
        {
            code:
            "import a from 'foo.js';\n" +
            "import {b, c} from 'bar.js';",
            output:
            "import {b, c} from 'bar.js';\n" +
            "import a from 'foo.js';",
            errors: [{
                message: "Expected 'multiple' syntax before 'single' syntax.",
                type: "ImportDeclaration"
            }]
        },
        {
            code:
            "import a from 'foo.js';\n" +
            "import * as b from 'bar.js';",
            output:
            "import * as b from 'bar.js';\n" +
            "import a from 'foo.js';",
            errors: [{
                message: "Expected 'all' syntax before 'single' syntax.",
                type: "ImportDeclaration"
            }]
        },
        {
            code:
            "import a from 'foo.js';\n" +
            "import 'bar.js';",
            output:
            "import 'bar.js';\n" +
            "import a from 'foo.js';",
            errors: [{
                message: "Expected 'none' syntax before 'single' syntax.",
                type: "ImportDeclaration"
            }]
        },
        {
            code:
            "import b from 'bar.js';\n" +
            "import * as a from 'foo.js';",
            output:
            "import * as a from 'foo.js';\n" +
            "import b from 'bar.js';",
            options: [{
                memberSyntaxSortOrder: [ "all", "single", "multiple", "none" ]
            }],
            errors: [{
                message: "Expected 'all' syntax before 'single' syntax.",
                type: "ImportDeclaration"
            }]
        },
        {
            code: "import {b, a, d, c} from 'foo.js';",
            output: "import {a, b, c, d} from 'foo.js';",
            errors: [{
                message: "Member 'a' of the import declaration should be sorted alphabetically.",
                type: "ImportSpecifier"
            }]
        },
        {
            code: "import {a, B, c, D} from 'foo.js';",
            output: "import {B, D, a, c} from 'foo.js';",
            errors: [{
                message: "Member 'B' of the import declaration should be sorted alphabetically.",
                type: "ImportSpecifier"
            }]
        },
        {
            code: "import {a, B, D, c} from 'foo.js';",
            output: "import {a, B, c, D} from 'foo.js';",
            options: ignoreCaseArgs,
            errors: [{
                message: "Member 'c' of the import declaration should be sorted alphabetically.",
                type: "ImportSpecifier"
            }]
        },
        // ensure that a single named import is treated differently from a default import
        {
            code:
            "import foo from 'foo';\n" +
            "import { bar } from 'bar';",
            output:
            "import { bar } from 'bar';\n" +
            "import foo from 'foo';",
            errors: [{
                message: "Expected 'multiple' syntax before 'single' syntax.",
                type: "ImportDeclaration"
            }]
        },
        // ensure that multiple named imports are sorted even when there's a default import
        {
            code: "import foo, {a, B, c, D} from 'foo.js';",
            output: "import foo, {B, D, a, c} from 'foo.js';",
            errors: [{
                message: "Member 'B' of the import declaration should be sorted alphabetically.",
                type: "ImportSpecifier"
            }]
        },
        {
            code: "import foo, {a, B, D, c} from 'foo.js';",
            output: "import foo, {a, B, c, D} from 'foo.js';",
            options: ignoreCaseArgs,
            errors: [{
                message: "Member 'c' of the import declaration should be sorted alphabetically.",
                type: "ImportSpecifier"
            }]
        },
        //multiline fixing tests
        {
            code:
            "import b from 'bar.js';\n" +
            "import c from 'baz.js';\n" +
            "import a from 'foo.js';",
            output:
            "import a from 'foo.js';\n" +
            "import b from 'bar.js';\n" +
            "import c from 'baz.js';",
            errors: [expectedError],
        },
        {
            code:
            "import b from 'bar.js';\n" +
            "import C from 'baz.js';\n" +
            "import a from 'foo.js';",
            output:
            "import C from 'baz.js';\n" +
            "import a from 'foo.js';\n" +
            "import b from 'bar.js';",
            errors: [expectedError],
        },
        {
            code:
            "import a from 'bar.js';\n" +
            "import b from 'baz.js';\n" +
            "import { c } from 'foo.js';",
            output:
            "import { c } from 'foo.js';\n" +
            "import a from 'bar.js';\n" +
            "import b from 'baz.js';",
            errors: [{
                message: "Expected 'multiple' syntax before 'single' syntax.",
                type: "ImportDeclaration"
            }],
        },
        {
            code:
            "import b from 'baz.js';\n" +
            "import a from 'bar.js';\n" +
            "import { c } from 'foo.js';",
            output:
            "import { c } from 'foo.js';\n" +
            "import a from 'bar.js';\n" +
            "import b from 'baz.js';",
            errors: [expectedError, {
                message: "Expected 'multiple' syntax before 'single' syntax.",
                type: "ImportDeclaration"
            }],
        },
        {
            code:
            "import a from 'bar.js';\n" +
            "import B from 'baz.js';\n" +
            "import { c } from 'foo.js';",
            output:
            "import { c } from 'foo.js';\n" +
            "import B from 'baz.js';\n" +
            "import a from 'bar.js';",
            errors: [expectedError, {
                message: "Expected 'multiple' syntax before 'single' syntax.",
                type: "ImportDeclaration"
            }],
        },
        {
            code:
            "import B from 'baz.js';\n" +
            "import * as a from 'bar.js';\n" +
            "import { c } from 'foo.js';",
            output:
            "import * as a from 'bar.js';\n" +
            "import { c } from 'foo.js';\n" +
            "import B from 'baz.js';",
            errors: [{
                message: "Expected 'all' syntax before 'single' syntax.",
                type: "ImportDeclaration"
            }],
        },
        {
            code:
            "import _ from 'lodash';\n" +
            "import { t, a, d } from 'i18next';\n" +
            "import ClientContext from 'api/Data/ClientContext';\n" +
            "import ConfirmDelete from 'web/Common/Helper/ConfirmDelete';\n" +
            "import DataStorage from 'api/DataStorage';\n" +
            "//comment\n" +
            "import LocaleOptions from 'api/User/LocaleOptions';\n" +
            "import moment from 'moment';\n" +
            "/*multi-line-comment \n"+
            "import React from 'react';\n" +
            "import Theme from 'theme';\n" +
            "multi-line-comment */\n"+
            "import EmployeePicture from 'web/Controls/EmployeePicture';\n" +
            "import ToggleableTextarea from 'web/Controls/ToggleableTextarea';\n" +
            "import UUID from 'uuid-js';\n" +
            "import * as notificationStorage from 'api/Notification/notificationStorage';\n" +
            "import DmsDataFactory from 'api/DMS/DmsDataFactory';\n" +
            "import DocumentUpload from 'web/Controls/DocumentUpload';\n" +
            "import Loading from 'web/Controls/Loading';\n",
            output:
            "import { a, d, t } from 'i18next';\n" +
            "import _ from 'lodash';\n" +
            "import ClientContext from 'api/Data/ClientContext';\n" +
            "import ConfirmDelete from 'web/Common/Helper/ConfirmDelete';\n" +
            "import DataStorage from 'api/DataStorage';\n" +
            "//comment\n" +
            "import LocaleOptions from 'api/User/LocaleOptions';\n" +
            "import moment from 'moment';\n" +
            "/*multi-line-comment \n"+
            "import React from 'react';\n" +
            "import Theme from 'theme';\n" +
            "multi-line-comment */\n"+
            "import * as notificationStorage from 'api/Notification/notificationStorage';\n" +
            "import DmsDataFactory from 'api/DMS/DmsDataFactory';\n" +
            "import DocumentUpload from 'web/Controls/DocumentUpload';\n" +
            "import EmployeePicture from 'web/Controls/EmployeePicture';\n" +
            "import Loading from 'web/Controls/Loading';\n" +
            "import ToggleableTextarea from 'web/Controls/ToggleableTextarea';\n" +
            "import UUID from 'uuid-js';\n",
            options: ignoreCaseArgs,
            errors: [{
                message: "Expected 'multiple' syntax before 'single' syntax.",
                type: "ImportDeclaration"
            },{
                message: "Member 'a' of the import declaration should be sorted alphabetically.",
                type: "ImportSpecifier"
            }, {
                message: "Expected 'all' syntax before 'single' syntax.",
                type: "ImportDeclaration"
            }],
        }, {
          code: `
          import './axiosDefaults';
          import './primus';
          import { Provider } from 'react-redux';
          import './cxsRender';
          import * as React from 'react';
          import { applyMiddleware, compose, createStore } from 'redux';
          import App from './Components/App';
          import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
          import ReactDOM from 'react-dom';
          import injectTapEventPlugin from 'react-tap-event-plugin';
          import promiseMiddleware from 'redux-promise';
          import reducer from './reducers';
          `,
          options: ignoreCaseArgs,
          errors: [{
              message: "Expected 'none' syntax before 'multiple' syntax.",
              type: "ImportDeclaration"
          }, expectedError],
          output: `
          import './axiosDefaults';
          import './cxsRender';
          import './primus';
          import * as React from 'react';
          import { applyMiddleware, compose, createStore } from 'redux';
          import { Provider } from 'react-redux';
          import App from './Components/App';
          import injectTapEventPlugin from 'react-tap-event-plugin';
          import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
          import promiseMiddleware from 'redux-promise';
          import ReactDOM from 'react-dom';
          import reducer from './reducers';
          `
        },
        {
          code: `
          import './axiosDefaults';
          import './primus';
          import './cxsRender';
          `,
          output: `
          import './axiosDefaults';
          import './cxsRender';
          import './primus';
          `,
          errors: [{
            expectedError,
          }],
          options: ignoreCaseArgs,
        },

        // Sort only consecutive imports
        {
            code:
            "import D from 'foo.js';\n" +
            "import B from 'bar.js';\n" +
            "\n" +
            "import A from 'baz.js';",
            output:
            "import B from 'bar.js';\n" +
            "import D from 'foo.js';\n" +
            "\n" +
            "import A from 'baz.js';",
            errors: [{
              expectedError,
            }],
        },
    ]
};

RuleTester.setDefaultConfig({
    parserOptions: {
      sourceType: 'module',
    }
});

var ruleTester = new RuleTester();
ruleTester.run("sort-imports - esprima", rule, fixtures);

RuleTester.setDefaultConfig({
    parser: 'babel-eslint'
});
ruleTester = new RuleTester();
ruleTester.run("sort-imports - babel-eslint", rule, fixtures);
