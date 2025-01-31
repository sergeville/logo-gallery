#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths to our standards documentation
const STANDARDS_PATH = path.join(__dirname, '../docs/design/STANDARDS.md');
const DESIGN_PATH = path.join(__dirname, '../docs/DESIGN.md');

// Validation functions
function validateImportPaths() {
  try {
    execSync('npm run fix-imports', { stdio: 'inherit' });
    console.log('✅ Import paths follow standards');
    return true;
  } catch (error) {
    console.error('❌ Import path validation failed');
    return false;
  }
}

function validateTypeScript() {
  try {
    execSync('npm run type-check', { stdio: 'inherit' });
    console.log('✅ TypeScript validation passed');
    return true;
  } catch (error) {
    console.error('❌ TypeScript validation failed');
    return false;
  }
}

function validateESLint() {
  try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('✅ ESLint validation passed');
    return true;
  } catch (error) {
    console.error('❌ ESLint validation failed');
    return false;
  }
}

function validatePrettier() {
  try {
    execSync('npm run format', { stdio: 'inherit' });
    console.log('✅ Prettier formatting passed');
    return true;
  } catch (error) {
    console.error('❌ Prettier formatting failed');
    return false;
  }
}

// Main validation function
async function validateStandards() {
  console.log('🔍 Validating against project standards...\n');
  
  const results = [
    validateImportPaths(),
    validateTypeScript(),
    validateESLint(),
    validatePrettier()
  ];

  const success = results.every(Boolean);

  if (success) {
    console.log('\n✨ All standards validation passed!');
    process.exit(0);
  } else {
    console.error('\n❌ Standards validation failed. Please fix the issues above.');
    process.exit(1);
  }
}

// Run validation
validateStandards().catch(error => {
  console.error('Error running validation:', error);
  process.exit(1);
}); 