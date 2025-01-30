module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['../*'],
          message: 'Use @/ imports instead of relative paths',
        },
      ],
    }],
    'import/order': ['error', {
      groups: [
        'builtin',
        'external',
        'internal',
        ['parent', 'sibling'],
        'index',
        'object',
        'type',
      ],
      pathGroups: [
        {
          pattern: '@/**',
          group: 'internal',
          position: 'after',
        },
      ],
      'newlines-between': 'always',
      alphabetize: {
        order: 'asc',
        caseInsensitive: true,
      },
    }],
  },
  ignorePatterns: ['.next/*', 'node_modules/*'],
}; 