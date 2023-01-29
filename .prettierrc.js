module.exports = {
  useTabs: false,
  tabWidth: 2,
  singleQuote: true,
  semi: true,
  arrowParens: 'avoid',
  printWidth: 120,
  trailingComma: 'all',
  bracketSpacing: true,
  jsxBracketSameLine: true,
  htmlWhitespaceSensitivity: 'ignore',
  overrides: [
    {
      files: '*.md',
      options: {
        printWidth: 80,
      },
    },
  ],
};
