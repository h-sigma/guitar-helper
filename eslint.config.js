import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default tseslint.config(
	{ ignores: ['dist', 'node_modules'] },

	// JavaScript base
	js.configs.recommended,

	// TypeScript
	...tseslint.configs.recommended,

	// Vue
	...pluginVue.configs['flat/recommended'],

	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},

	{
		files: ['**/*.vue'],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser
			}
		}
	},

	{
		rules: {
			// TypeScript
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/no-explicit-any': 'warn',

			// Vue
			'vue/multi-word-component-names': 'off',
			'vue/no-unused-vars': 'error',
			'vue/require-default-prop': 'off',
			'vue/no-v-html': 'warn',

			// General
			'no-console': 'warn',
			'no-debugger': 'error'
		}
	}
)
