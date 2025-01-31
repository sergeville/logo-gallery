module.exports = {
  // Run type-check on TypeScript files
  '**/*.ts?(x)': () => 'npm run type-check',
  
  // Lint and format TypeScript and JavaScript files
  '**/*.(ts|tsx|js)': filenames => [
    `npm run lint --fix ${filenames.join(' ')}`,
    `npm run format ${filenames.join(' ')}`,
  ],
  
  // Format Markdown and JSON files
  '**/*.(md|json)': filenames => `npm run format ${filenames.join(' ')}`,
} 