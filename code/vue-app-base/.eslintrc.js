module.exports = {
  env: {
    browser: true,
    es2020: true
  },
  extends: [
    'plugin:vue/essential',
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
    parser: 'babel-eslint'
  },
  plugins: [
    'vue'
  ],
  rules: {
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    semi: ['off', 'always'],
    indent: ['error', 2],
    'space-before-function-paren': 0,
    'object-curly-spacing': 0,
    'no-console': 1
  }
}
