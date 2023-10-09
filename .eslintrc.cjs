module.exports = {
	env: {
		es2022: true,
		node: true,
		jest: true
	},
	extends: [
		"eslint:recommended",
		"plugin:eslint-comments/recommended",
		"plugin:n/recommended",
		"plugin:perfectionist/recommended-natural",
		"plugin:@typescript-eslint/recommended",
		"plugin:regexp/recommended",
		"plugin:jest/recommended"
	],
	overrides: [
		{
			extends: ["plugin:@typescript-eslint/strict", "plugin:@typescript-eslint/stylistic"],
			files: ["**/*.ts"],
			parser: "@typescript-eslint/parser",
			rules: {
				"logical-assignment-operators": [
					"error",
					"always",
					{ enforceForIfStatements: true }
				],
				"operator-assignment": "error"
			}
		},
		{
			excludedFiles: ["**/*.md/*.ts"],
			extends: [
				"plugin:@typescript-eslint/strict-type-checked",
				"plugin:@typescript-eslint/stylistic-type-checked"
			],
			files: ["**/*.ts"],
			parser: "@typescript-eslint/parser",
			parserOptions: {
				project: "./tsconfig.eslint.json"
			},
			rules: {
				"@typescript-eslint/await-thenable": "off",
				"@typescript-eslint/consistent-type-definitions": ["error", "type"],
				"@typescript-eslint/explicit-function-return-type": "error",
				"@typescript-eslint/no-explicit-any": "error",
				"@typescript-eslint/no-floating-promises": "off",
				"@typescript-eslint/no-misused-promises": "off",
				"@typescript-eslint/no-non-null-assertion": "error",
				"@typescript-eslint/no-unnecessary-condition": [
					"error",
					{
						allowConstantLoopConditions: true
					}
				],
				"@typescript-eslint/prefer-for-of": "off",
				"@typescript-eslint/no-unused-vars": "off",
				"@typescript-eslint/padding-line-between-statements": [
					"error",
					{ blankLine: "always", next: "*", prev: ["const", "let", "var"] },
					{
						blankLine: "any",
						next: ["const", "let", "var"],
						prev: ["const", "let", "var"]
					},
					{ blankLine: "always", next: "*", prev: "directive" },
					{ blankLine: "any", next: "directive", prev: "directive" },
					{ blankLine: "always", next: "*", prev: "expression" },
					{ blankLine: "any", next: "break", prev: "expression" }
				],
				"@typescript-eslint/prefer-nullish-coalescing": [
					"error",
					{ ignorePrimitives: true }
				],
				curly: "error",
				"deprecation/deprecation": "error",
				"n/no-missing-import": "off"
			}
		},
		{
			excludedFiles: ["package.json"],
			extends: ["plugin:jsonc/recommended-with-json"],
			files: ["*.json", "*.jsonc"],
			parser: "jsonc-eslint-parser",
			rules: {
				"jsonc/no-comments": "off",
				"jsonc/sort-keys": "error"
			}
		},
		{
			files: ["*.jsonc"],
			rules: {
				"jsonc/no-comments": "off"
			}
		},
		{
			files: ["**/*.test.ts"],
			// excludedFiles: ["___tests___"],
			rules: {
				// These on-by-default rules aren't useful in test files.
				"@typescript-eslint/no-unsafe-assignment": "off",
				"@typescript-eslint/no-unsafe-call": "off",
				"@typescript-eslint/no-unsafe-member-access": "off",
				"@typescript-eslint/no-explicit-any": "off"
			}
		}
	],
	parser: "@typescript-eslint/parser",
	plugins: [
		"@typescript-eslint",
		"deprecation",
		"jsdoc",
		"no-only-tests",
		"perfectionist",
		"regexp",
		"jest"
	],
	reportUnusedDisableDirectives: true,
	root: true,
	rules: {
		// These off/less-strict-by-default rules work well for this repo and we like them on.
		"@typescript-eslint/no-unused-vars": ["error", { caughtErrors: "all" }],
		// Stylistic concerns that don't interfere with Prettier
		"@typescript-eslint/padding-line-between-statements": [
			"error",
			{ blankLine: "always", next: "*", prev: "block-like" }
		],

		"eslint-comments/disable-enable-pair": "off",
		// These on-by-default rules don't work well for this repo and we like them off.
		"no-case-declarations": "off",
		"no-constant-condition": "off",
		"no-inner-declarations": "off",

		"no-mixed-spaces-and-tabs": "off",
		"no-only-tests/no-only-tests": "error",
		"perfectionist/sort-classes": "off",
		"perfectionist/sort-objects": "off",
		"perfectionist/sort-object-types": "off",
		"n/no-unpublished-import": [
			"error",
			{
				allowModules: ["supertest", "jest", "dotenv"]
			}
		],
		"object-shorthand": "error"
	}
};
