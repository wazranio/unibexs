#!/usr/bin/env node

/**
 * Comprehensive Configuration Fixer
 * 
 * Fixes all missing properties in workflow configuration files
 * to prevent runtime TypeScript errors.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing all workflow configuration errors...');

// File paths to fix
const configFiles = [
  path.join(__dirname, '..', 'src', 'lib', 'workflow', 'stages', 'stage-1-config.ts'),
  path.join(__dirname, '..', 'src', 'lib', 'workflow', 'stages', 'stage-2-config.ts')
];

/**
 * Fix missing rule properties in all rules sections
 */
function fixMissingRuleProperties(content) {
  let fixed = content;
  
  // Pattern to find rules sections and check for missing properties
  const rulesRegex = /rules:\s*\{([^}]+)\}/g;
  let match;
  
  while ((match = rulesRegex.exec(content)) !== null) {
    const rulesSection = match[1];
    const fullMatch = match[0];
    
    // Check if missing requiresDocuments
    if (!rulesSection.includes('requiresDocuments:')) {
      const updatedRules = fullMatch.replace(
        /requiresConfirmation:\s*(true|false)\s*\n/,
        'requiresConfirmation: $1,\n        requiresDocuments: false,\n        partialSubmission: false\n'
      );
      fixed = fixed.replace(fullMatch, updatedRules);
    }
  }
  
  return fixed;
}

/**
 * Fix null assignments to undefined
 */
function fixNullAssignments(content) {
  let fixed = content;
  fixed = fixed.replace(/actionButtonText: null/g, 'actionButtonText: undefined');
  fixed = fixed.replace(/actionButtonSecondary: null/g, 'actionButtonSecondary: undefined');
  return fixed;
}

/**
 * Process each configuration file
 */
function fixConfigFile(filePath) {
  const filename = path.basename(filePath);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${filename}: File not found, skipping`);
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`🔧 Processing ${filename}...`);
    
    // Apply fixes
    content = fixMissingRuleProperties(content);
    content = fixNullAssignments(content);
    
    // Write back to file
    fs.writeFileSync(filePath, content);
    
    console.log(`✅ Fixed ${filename}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filename}: ${error.message}`);
  }
}

// Process all configuration files
for (const filePath of configFiles) {
  fixConfigFile(filePath);
}

console.log('🎉 All configuration fixes completed!');
console.log('\n📝 Next steps:');
console.log('1. Run: npm run validate');
console.log('2. Run: npm run typecheck');
console.log('3. If issues remain, run: npm run validate:quick');