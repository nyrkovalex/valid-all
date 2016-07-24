const INDENT_WITH_N_SPACES = 2;

module.exports = {
  'env': {
    'es6': true,
    'node': true,
    'mocha': true
  },
  'extends': 'eslint:recommended',
  'rules': {
    'indent': [ 'error', INDENT_WITH_N_SPACES, { 'SwitchCase': 1 } ],
    'linebreak-style': [ 'error', 'unix' ],
    'quotes': [ 'error', 'single' ],
    'semi': [ 'error', 'always' ],
    'eqeqeq': [ 'error', 'always' ],
    'no-var': [ 'error' ],
    'space-before-function-paren': [ 'error', 'always' ],
    'array-bracket-spacing': [ 'error', 'always' ],
    'object-curly-spacing': [ 'error', 'always' ],
    'no-shadow': [ 'error' ],
    'no-trailing-spaces': [ 'error' ],
    'space-infix-ops': [ 'error' ],
    'keyword-spacing': [ 'error' ]
  }
};
