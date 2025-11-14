import baseConfig from 'eslint-config-minimal-tabs';
export default {
	...baseConfig,
	languageOptions: {
		globals: {
			node: true,
		},
		parserOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module'
		}
	},

};
