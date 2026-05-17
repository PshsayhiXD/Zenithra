// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import unicorn from "eslint-plugin-unicorn";
import importX from "eslint-plugin-import-x";
import globals from "globals";

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */ // @ts-ignore
export default [
  {
    ignores: ["dist/", "node_modules/", "data/", "assets/", ".cache/", "_test.ts"],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
      reportUnusedInlineConfigs: "error",
    },
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  unicorn.configs.recommended,
  {
    files: ["src/**/*.ts", "drednot-client/*.mjs"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.json", "./drednot-client/tsconfig.json"],
        // @ts-ignore
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      unicorn,
      "import-x": importX,
    },
    settings: {
      "import-x/resolver": {
        typescript: {
          project: ["./tsconfig.json", "./drednot-client/tsconfig.json"],
        },
        node: {
          extensions: [".js", ".ts"],
        },
      },
    },
  },
  {
    files: ["drednot-client/src/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: ["./drednot-client/tsconfig.json"],
        // @ts-ignore
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      unicorn,
      "import-x": importX,
    },
    settings: {
      "import-x/resolver": {
        typescript: {
          project: ["./drednot-client/tsconfig.json"],
        },
        node: {
          extensions: [".js", ".ts"],
        },
      },
    },
  },
  {
    files: ["src/**/*.ts", "drednot-client/**/*.ts", "drednot-client/*.mjs"],
    rules: {
      "import-x/extensions": [
        "error",
        "always",
        {
          ignorePackages: true,
          pattern: {
            ts: "never",
          },
        },
      ],
      "import-x/no-unresolved": "error",
      "import-x/no-duplicates": "error",
      "import-x/no-self-import": "error",
      "import-x/no-useless-path-segments": "error",
      "import-x/first": "error",
      "import-x/no-mutable-exports": "error",

      "unicorn/filename-case": ["error", { case: "camelCase" }],
      "unicorn/no-null": "off",
      "unicorn/prefer-spread": "off",
      "unicorn/no-array-sort": "off",
      "unicorn/no-array-reverse": "off",
      "unicorn/prefer-export-from": "off",
      "unicorn/prefer-module": "off",
      "unicorn/prefer-string-replace-all": "off",
      "unicorn/better-regex": "error",
      "unicorn/consistent-function-scoping": "error",
      "unicorn/isolated-functions": "error",
      "unicorn/no-array-callback-reference": "error",
      "unicorn/no-array-for-each": "error",
      "unicorn/no-array-reduce": ["error", { allowSimpleOperations: false }],
      "unicorn/prefer-at": "error",
      "unicorn/prefer-includes": "error",
      "unicorn/prefer-object-from-entries": "error",
      "unicorn/prefer-set-has": "error",
      "unicorn/prefer-simple-condition-first": "error",
      "unicorn/no-abusive-eslint-disable": "error",
      "unicorn/no-process-exit": "off",

      "object-shorthand": ["error", "always"],
      "arrow-body-style": ["error", "as-needed"],
      "prefer-template": "error",
      "prefer-object-spread": "error",
      "require-atomic-updates": "error",
      "no-unsafe-optional-chaining": "error",
      "no-var": "error",
      "prefer-const": "error",
      "eqeqeq": ["error", "always"],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "error",
      "no-duplicate-imports": "error",
      "no-throw-literal": "error",
      "no-unreachable": "error",
      "no-implicit-coercion": "error",
      "no-return-await": "error",
      "no-unused-vars": "off",
      "quotes": [
        "error",
        "double",
        {
          avoidEscape: true,
          allowTemplateLiterals: false,
        },
      ],
      "func-style": ["error", "expression", { allowArrowFunctions: true }],
      "no-restricted-syntax": [
        "error",
        {
          selector: "Property[method=true]",
          message: "Use arrow function instead of method shorthand.",
        },
      ],
      "no-shadow": "off",
      "no-useless-constructor": "off",
      "no-useless-rename": "error",
      "no-lonely-if": "error",
      "no-nested-ternary": "error",
      "no-unneeded-ternary": "error",
      "no-useless-computed-key": "error",
      "no-useless-concat": "error",
      "no-useless-escape": "error",
      "no-useless-return": "error",
      "no-else-return": ["error", { allowElseIf: false }],
      "no-empty": ["error", { allowEmptyCatch: false }],

      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-useless-constructor": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: false,
        },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: true,
        },
      ],
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/strict-boolean-expressions": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/restrict-template-expressions": "error",
      "@typescript-eslint/no-base-to-string": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
        },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/prefer-regexp-exec": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/dot-notation": [
        "error",
        {
          allowIndexSignaturePropertyAccess: true,
        },
      ],
      //"@typescript-eslint/no-empty-function": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
      "@typescript-eslint/prefer-return-this-type": "error",
      "@typescript-eslint/no-confusing-void-expression": "error",
      "@typescript-eslint/prefer-reduce-type-parameter": "error",
      "@typescript-eslint/no-redundant-type-constituents": "error",
      "@typescript-eslint/consistent-indexed-object-style": ["error", "record"],
      "@typescript-eslint/no-duplicate-type-constituents": "error",
    },
  },
];
