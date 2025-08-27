#!/usr/bin/env node

/**
 * Workflow Configuration Validator
 * 
 * Validates all workflow configurations to catch issues before runtime.
 * This prevents TypeErrors like "Cannot read properties of undefined (reading 'urgencyLevel')"
 * and ensures all status configurations are complete and valid.
 */

const fs = require('fs');
const path = require('path');

// ANSI colors for console output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

console.log(`${colors.cyan}${colors.bold}🔍 Workflow Configuration Validator${colors.reset}\n`);

// File paths to validate
const configFiles = [
  path.join(__dirname, '..', 'src', 'lib', 'workflow', 'stages', 'stage-1-config.ts'),
  path.join(__dirname, '..', 'src', 'lib', 'workflow', 'stages', 'stage-2-config.ts'),
  // Add more stages as they are created
];

// Required properties for validation
const requiredRuleProperties = [
  'isDocumentUploadStatus',
  'isDocumentReviewStatus', 
  'isPaymentStatus',
  'isTerminalStatus',
  'requiresUrgentAction',
  'showsInDashboard',
  'allowsBulkUpdate',
  'expandsDocumentSection',
  'expandsTimelineSection',
  'blocksNavigation',
  'autoRefreshRequired',
  'requiresConfirmation',
  'requiresDocuments',
  'partialSubmission'
];

const requiredStylingProperties = [
  'statusColor',
  'statusIcon', 
  'urgencyLevel',
  'badgeVariant',
  'progressStep',
  'progressTotal'
];

const requiredTextProperties = [
  'statusCard',
  'primaryMessage',
  'dashboardTitle',
  'listViewStatus',
  'heroCardTitle',
  'heroCardSubtitle',
  'heroCardDescription',
  'timelineTitle',
  'timelineDescription'
];

const userRoles = ['admin', 'partner'];

// Validation results
let totalErrors = 0;
let totalWarnings = 0;
let totalStatuses = 0;
let validatedFiles = 0;

/**
 * Extract status configurations from TypeScript file content
 */
function extractStatusConfigs(content, filename) {
  const statuses = {};
  
  // Simple regex to find status blocks - this is basic but works for our structure
  const statusRegex = /(\w+):\s*\{[\s\S]*?(?=\n\s{4}\w+:\s*\{|\n\s{2}\};\s*$)/g;
  let match;
  
  while ((match = statusRegex.exec(content)) !== null) {
    const statusKey = match[1];
    const statusBlock = match[0];
    
    // Skip if this looks like a top-level property (stages, etc)
    if (statusKey === 'stages' || statusKey === 'export' || statusKey === 'const') {
      continue;
    }
    
    statuses[statusKey] = statusBlock;
    totalStatuses++;
  }
  
  console.log(`${colors.blue}📁 ${filename}:${colors.reset} Found ${Object.keys(statuses).length} status configurations`);
  return statuses;
}

/**
 * Validate a single status configuration
 */
function validateStatus(statusKey, statusBlock, filename) {
  const errors = [];
  const warnings = [];
  
  // Check if status has rules section
  if (!statusBlock.includes('rules:')) {
    errors.push(`Missing 'rules' section`);
  } else {
    // Check required rule properties
    for (const prop of requiredRuleProperties) {
      if (!statusBlock.includes(`${prop}:`)) {
        errors.push(`Missing rule property: ${prop}`);
      }
    }
  }
  
  // Check if status has display section
  if (!statusBlock.includes('display:')) {
    errors.push(`Missing 'display' section`);
  } else {
    // Check each user role
    for (const role of userRoles) {
      if (!statusBlock.includes(`${role}:`)) {
        errors.push(`Missing display section for role: ${role}`);
        continue;
      }
      
      // Check for styling section for each role
      const roleSection = extractRoleSection(statusBlock, role);
      if (!roleSection.includes('styling:')) {
        errors.push(`Missing 'styling' section for ${role}`);
      } else {
        // Check required styling properties
        for (const prop of requiredStylingProperties) {
          if (!roleSection.includes(`${prop}:`)) {
            errors.push(`Missing styling property: ${role}.${prop}`);
          }
        }
      }
      
      // Check for allText section
      if (!roleSection.includes('allText:')) {
        warnings.push(`Missing 'allText' section for ${role} (recommended for copy management)`);
      } else {
        // Check important text properties
        for (const prop of requiredTextProperties) {
          if (!roleSection.includes(`${prop}:`)) {
            warnings.push(`Missing text property: ${role}.allText.${prop}`);
          }
        }
      }
    }
  }
  
  // Check authority section
  if (!statusBlock.includes('authority:')) {
    errors.push(`Missing 'authority' section`);
  }
  
  // Check if terminal status has proper configuration
  if (statusBlock.includes('isTerminalStatus: true')) {
    // Terminal statuses should not have transitions for most actors
    if (statusBlock.includes('adminTransitions: [') && 
        !statusBlock.includes('adminTransitions: []')) {
      warnings.push(`Terminal status has admin transitions (may not be intended)`);
    }
    if (statusBlock.includes('partnerTransitions: [') && 
        !statusBlock.includes('partnerTransitions: []')) {
      warnings.push(`Terminal status has partner transitions (may not be intended)`);
    }
  }
  
  return { errors, warnings };
}

/**
 * Extract role section from status block
 */
function extractRoleSection(statusBlock, role) {
  const roleRegex = new RegExp(`${role}:\\s*\\{[\\s\\S]*?(?=\\n\\s{8}\\w+:|\\n\\s{6}\\})`, 'g');
  const match = roleRegex.exec(statusBlock);
  return match ? match[0] : '';
}

/**
 * Validate a configuration file
 */
function validateConfigFile(filePath) {
  const filename = path.basename(filePath);
  
  if (!fs.existsSync(filePath)) {
    console.log(`${colors.yellow}⚠️  ${filename}: File not found, skipping${colors.reset}`);
    return;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const statuses = extractStatusConfigs(content, filename);
    
    let fileErrors = 0;
    let fileWarnings = 0;
    
    for (const [statusKey, statusBlock] of Object.entries(statuses)) {
      const result = validateStatus(statusKey, statusBlock, filename);
      
      if (result.errors.length > 0) {
        console.log(`${colors.red}❌ ${filename} -> ${statusKey}:${colors.reset}`);
        result.errors.forEach(error => {
          console.log(`   ${colors.red}• ${error}${colors.reset}`);
          fileErrors++;
        });
      }
      
      if (result.warnings.length > 0) {
        console.log(`${colors.yellow}⚠️  ${filename} -> ${statusKey}:${colors.reset}`);
        result.warnings.forEach(warning => {
          console.log(`   ${colors.yellow}• ${warning}${colors.reset}`);
          fileWarnings++;
        });
      }
      
      if (result.errors.length === 0 && result.warnings.length === 0) {
        console.log(`${colors.green}✅ ${filename} -> ${statusKey}: OK${colors.reset}`);
      }
    }
    
    totalErrors += fileErrors;
    totalWarnings += fileWarnings;
    validatedFiles++;
    
  } catch (error) {
    console.log(`${colors.red}❌ Error reading ${filename}: ${error.message}${colors.reset}`);
    totalErrors++;
  }
}

/**
 * Check TypeScript compilation
 */
async function checkTypeScriptCompilation() {
  console.log(`\n${colors.cyan}🔧 Checking TypeScript compilation...${colors.reset}`);
  
  const { spawn } = require('child_process');
  
  return new Promise((resolve) => {
    const tsc = spawn('npx', ['tsc', '--noEmit'], {
      cwd: path.join(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let output = '';
    let hasErrors = false;
    
    tsc.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    tsc.stderr.on('data', (data) => {
      output += data.toString();
      hasErrors = true;
    });
    
    tsc.on('close', (code) => {
      if (code === 0 && !hasErrors) {
        console.log(`${colors.green}✅ TypeScript compilation: OK${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ TypeScript compilation errors:${colors.reset}`);
        console.log(output);
        totalErrors++;
      }
      resolve();
    });
    
    tsc.on('error', (error) => {
      console.log(`${colors.yellow}⚠️  Could not run TypeScript check: ${error.message}${colors.reset}`);
      console.log(`${colors.yellow}   Make sure TypeScript is installed: npm install -g typescript${colors.reset}`);
      resolve();
    });
  });
}

/**
 * Main validation function
 */
async function validateWorkflowConfigs() {
  console.log(`${colors.blue}Validating workflow configuration files...${colors.reset}\n`);
  
  // Validate each config file
  for (const filePath of configFiles) {
    validateConfigFile(filePath);
    console.log(''); // Add spacing between files
  }
  
  // Check TypeScript compilation
  await checkTypeScriptCompilation();
  
  // Summary
  console.log(`\n${colors.cyan}${colors.bold}📊 Validation Summary:${colors.reset}`);
  console.log(`${colors.blue}Files validated: ${validatedFiles}${colors.reset}`);
  console.log(`${colors.blue}Statuses checked: ${totalStatuses}${colors.reset}`);
  
  if (totalErrors > 0) {
    console.log(`${colors.red}❌ Errors: ${totalErrors}${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ Errors: 0${colors.reset}`);
  }
  
  if (totalWarnings > 0) {
    console.log(`${colors.yellow}⚠️  Warnings: ${totalWarnings}${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ Warnings: 0${colors.reset}`);
  }
  
  console.log('');
  
  if (totalErrors > 0) {
    console.log(`${colors.red}${colors.bold}❌ Validation failed! Fix errors before deploying.${colors.reset}`);
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log(`${colors.yellow}${colors.bold}⚠️  Validation passed with warnings. Consider fixing warnings.${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.green}${colors.bold}✅ All validations passed! Workflow configurations are healthy.${colors.reset}`);
    process.exit(0);
  }
}

// Run validation
validateWorkflowConfigs().catch(error => {
  console.error(`${colors.red}❌ Validation script failed: ${error.message}${colors.reset}`);
  process.exit(1);
});