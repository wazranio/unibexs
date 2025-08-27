#!/usr/bin/env node

/**
 * Quick fix script for TypeScript compilation errors
 * Adds missing properties to workflow configurations
 */

const fs = require('fs');
const path = require('path');

// File paths
const stage1ConfigPath = path.join(__dirname, '..', 'src', 'lib', 'workflow', 'stages', 'stage-1-config.ts');

console.log('🔧 Fixing TypeScript compilation errors...');

// Read the file
let content = fs.readFileSync(stage1ConfigPath, 'utf8');

// Fix missing rule properties - add to all rule sections that are missing them
const patterns = [
  {
    search: /(\s+requiresConfirmation: false\s*\n\s*}\,?\s*\n)/g,
    replace: '$1'.replace('requiresConfirmation: false', 'requiresConfirmation: false,\n        requiresDocuments: false,\n        partialSubmission: false')
  },
  {
    search: /(\s+requiresConfirmation: true\s*\n\s*}\,?\s*\n)/g,
    replace: '$1'.replace('requiresConfirmation: true', 'requiresConfirmation: true,\n        requiresDocuments: false,\n        partialSubmission: false')
  }
];

// Apply fixes
patterns.forEach(({search, replace}) => {
  content = content.replace(search, replace);
});

// Special fixes for statuses that should have different values
const specialCases = [
  // correction_requested_admin should require documents
  {
    search: /(correction_requested_admin:[\s\S]*?requiresDocuments: false)/,
    replace: '$1'.replace('requiresDocuments: false', 'requiresDocuments: true')
  },
  // documents_partially_submitted should be partial submission
  {
    search: /(documents_partially_submitted:[\s\S]*?partialSubmission: false)/,
    replace: '$1'.replace('partialSubmission: false', 'partialSubmission: true')
  }
];

specialCases.forEach(({search, replace}) => {
  content = content.replace(search, replace);
});

// Write back to file
fs.writeFileSync(stage1ConfigPath, content);

console.log('✅ Fixed Stage 1 configuration TypeScript errors');

// Fix null issues - replace actionButtonText: null with actionButtonText: undefined
content = content.replace(/actionButtonText: null/g, 'actionButtonText: undefined');
content = content.replace(/actionButtonSecondary: null/g, 'actionButtonSecondary: undefined');

fs.writeFileSync(stage1ConfigPath, content);

console.log('✅ Fixed null assignment issues');

console.log('🎉 All TypeScript fixes applied to stage-1-config.ts');