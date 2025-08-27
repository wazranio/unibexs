/**
 * React Hook for Workflow Engine
 * 
 * Provides easy access to the workflow engine in React components.
 * Handles initialization and provides helper functions.
 */

import { useMemo } from 'react';
import { WorkflowEngine } from './workflow-engine';
import { CopyManager } from './copy-manager';
import { StatusInfo, UserRole } from './stages/types';
import COMPLETE_WORKFLOW_CONFIG from './workflow-config';

export interface UseWorkflowEngineReturn {
  engine: WorkflowEngine;
  copyManager: CopyManager;
  
  // Helper functions for common operations
  getStatusInfo: (stage: number, status: string, role: UserRole) => StatusInfo;
  getText: (stage: number, status: string, role: UserRole, field: string) => string;
  canUpdate: (stage: number, status: string, role: UserRole) => boolean;
  getActions: (stage: number, status: string, role: UserRole) => any[];
  hasRule: (stage: number, status: string, rule: string) => boolean;
  isTerminalStatus: (stage: number, status: string) => boolean;
  
  // Validation helpers
  validateTransition: (currentStage: number, currentStatus: string, targetStatus: string, actor: string) => { allowed: boolean; reason?: string };
}

export function useWorkflowEngine(): UseWorkflowEngineReturn {
  const engine = useMemo(() => {
    return WorkflowEngine.getInstance(COMPLETE_WORKFLOW_CONFIG);
  }, []);

  const copyManager = useMemo(() => {
    return new CopyManager(engine);
  }, [engine]);

  // Helper functions
  const getStatusInfo = (stage: number, status: string, role: UserRole): StatusInfo => {
    return engine.getStatusDisplay(stage, status, role);
  };

  const getText = (stage: number, status: string, role: UserRole, field: string): string => {
    return engine.getText(stage, status, role, field as any);
  };

  const canUpdate = (stage: number, status: string, role: UserRole): boolean => {
    const actor = role === 'admin' ? 'Admin' : 'Partner';
    return engine.canActorUpdate(stage, status, actor);
  };

  const getActions = (stage: number, status: string, role: UserRole): any[] => {
    return engine.getAllActions(stage, status, role);
  };

  const hasRule = (stage: number, status: string, rule: string): boolean => {
    return engine.hasRule(stage, status, rule as any);
  };

  const isTerminalStatus = (stage: number, status: string): boolean => {
    return engine.isTerminalStatus(stage, status);
  };

  const validateTransition = (
    currentStage: number, 
    currentStatus: string, 
    targetStatus: string, 
    actor: string
  ) => {
    const workflowActor = actor === 'admin' ? 'Admin' : 'Partner';
    return engine.validateTransition(currentStage, currentStatus, targetStatus, workflowActor);
  };

  return {
    engine,
    copyManager,
    getStatusInfo,
    getText,
    canUpdate,
    getActions,
    hasRule,
    isTerminalStatus,
    validateTransition
  };
}

export default useWorkflowEngine;