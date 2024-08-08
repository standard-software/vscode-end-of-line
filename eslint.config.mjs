import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  { files: [`**/*.js`], languageOptions: { sourceType: `commonjs` } },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  {
    rules: {
      'indent': [
        `error`,
        2
      ],
      'linebreak-style': [
        `error`,
        `unix`
      ],
      'quotes': [
        `warn`,
        `backtick`
      ],
      'semi': [
        `error`,
        `always`
      ],
      'no-undef': [`off`],
      'no-unused-vars': `off`,
      'no-multi-spaces': [`off`],
      'no-constant-condition': [`off`],

      'object-curly-spacing': [`error`, `always`],
      'array-bracket-spacing': [`error`, `never`],
      'space-in-parens': [`error`, `never`],
      'no-empty': [`off`],
    },
  },
];
