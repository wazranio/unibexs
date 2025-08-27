/**
 * Complete Workflow Configuration
 * 
 * This file combines all stage configurations into a single
 * workflow configuration that the WorkflowEngine can use.
 * 
 * NO MORE HARDCODED LOGIC - Everything is configuration-driven!
 */

import { WorkflowConfiguration } from './stages/types';
import STAGE_1_CONFIG from './stages/stage-1-config';
import STAGE_2_CONFIG from './stages/stage-2-config';

export const COMPLETE_WORKFLOW_CONFIG: WorkflowConfiguration = {
  stages: {
    1: STAGE_1_CONFIG,
    2: STAGE_2_CONFIG,
    // Stage 3-5 configurations will be added here later
  },
  
  globalSettings: {
    timeoutDays: 30,
    maxRetries: 3,
    notificationSettings: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      reminderInterval: 24, // hours
      escalationInterval: 72 // hours
    },
    auditSettings: {
      logAllActions: true,
      retentionDays: 365,
      sensitiveFieldsEncrypted: true,
      auditTrailEnabled: true
    }
  },
  
  version: "2.0.0",
  lastUpdated: "2025-08-26"
};

export default COMPLETE_WORKFLOW_CONFIG;