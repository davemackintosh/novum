import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import pluginImport from 'eslint-plugin-import';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		plugins: {
			import: { rules: pluginImport.rules },
		},
		rules: {
			'import/order': 'error',
			'import/group-exports': 'error',
			'import/exports-last': 'error',
		},
	},
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		ignores: ['build/', '.svelte-kit/', 'dist/']
	},
	...svelte.configs['flat/prettier'],
	prettier,
];
