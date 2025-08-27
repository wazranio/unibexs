/* eslint-disable @typescript-eslint/no-unused-vars */
import { Application } from '@/types';
import { WorkflowService } from './index';

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    event: string;
    conditions: Record<string, unknown>;
  };
  actions: Array<{
    type: 'status_change' | 'notification' | 'document_request' | 'payment_request';
    parameters: Record<string, unknown>;
  }>;
  isActive: boolean;
}

export class WorkflowAutomation {
  private static rules: AutomationRule[] = [
    // Stage 1 System Auto-Transitions (from PDF)
    {
      id: 'stage1-new-app-created',
      name: 'Stage 1: New Application Created',
      description: 'System sets new_application after partner submits',
      trigger: {
        event: 'application_submitted',
        conditions: {
          stage: 1,
          actor: 'Partner'
        }
      },
      actions: [
        {
          type: 'status_change',
          parameters: {
            status: 'new_application'
          }
        }
      ],
      isActive: true
    },
    {
      id: 'stage1-docs-uploaded',
      name: 'Stage 1: Documents Uploaded',
      description: 'System sets documents_submitted after partner uploads all docs',
      trigger: {
        event: 'documents_uploaded',
        conditions: {
          stage: 1,
          uploadComplete: true
        }
      },
      actions: [
        {
          type: 'status_change',
          parameters: {
            status: 'documents_submitted'
          }
        }
      ],
      isActive: true
    },
    {
      id: 'stage1-partial-docs-uploaded',
      name: 'Stage 1: Partial Documents Uploaded',
      description: 'System sets documents_partially_submitted after partner uploads some docs',
      trigger: {
        event: 'documents_uploaded',
        conditions: {
          stage: 1,
          uploadComplete: false
        }
      },
      actions: [
        {
          type: 'status_change',
          parameters: {
            status: 'documents_partially_submitted'
          }
        }
      ],
      isActive: true
    },
    {
      id: 'stage1-docs-approved',
      name: 'Stage 1: Documents Approved Auto-Approval',
      description: 'System can trigger approved_stage1 after admin approves documents',
      trigger: {
        event: 'status_changed',
        conditions: {
          stage: 1,
          currentStatus: 'documents_approved',
          actor: 'Admin'
        }
      },
      actions: [
        {
          type: 'status_change',
          parameters: {
            status: 'approved_stage1'
          }
        }
      ],
      isActive: true
    },
    {
      id: 'stage1-to-stage2-transition',
      name: 'Stage 1 to Stage 2 Auto-Transition',
      description: 'System moves to Stage 2 after approved_stage1',
      trigger: {
        event: 'status_changed',
        conditions: {
          stage: 1,
          currentStatus: 'approved_stage1'
        }
      },
      actions: [
        {
          type: 'status_change',
          parameters: {
            nextStage: 2,
            status: 'sent_to_university'
          }
        }
      ],
      isActive: true
    },
    {
      id: 'auto-stage-transition',
      name: 'Automatic Stage Transition',
      description: 'Automatically move to next stage when conditions are met',
      trigger: {
        event: 'status_changed',
        conditions: {
          statusType: 'stage_completion'
        }
      },
      actions: [
        {
          type: 'status_change',
          parameters: {
            nextStage: true
          }
        }
      ],
      isActive: true
    },
    {
      id: 'document-expiry-reminder',
      name: 'Document Expiry Reminder',
      description: 'Send reminders when documents are about to expire',
      trigger: {
        event: 'schedule',
        conditions: {
          frequency: 'daily',
          checkExpiry: 30 // days
        }
      },
      actions: [
        {
          type: 'notification',
          parameters: {
            type: 'document_expiry_warning'
          }
        }
      ],
      isActive: true
    }
  ];

  static async processApplication(application: Application, event: string, metadata?: Record<string, unknown>): Promise<Application> {
    console.log(`Processing automation for application ${application.id}, event: ${event}`);
    
    let updatedApplication = { ...application };
    
    // Find applicable rules
    const applicableRules = this.rules.filter(rule => 
      rule.isActive && rule.trigger.event === event
    );

    for (const rule of applicableRules) {
      try {
        updatedApplication = await this.applyRule(updatedApplication, rule, metadata);
      } catch (error) {
        console.error(`Failed to apply automation rule ${rule.id}:`, error);
      }
    }

    return updatedApplication;
  }

  private static async applyRule(
    application: Application, 
    rule: AutomationRule, 
    metadata?: Record<string, unknown>
  ): Promise<Application> {
    
    // Check if rule conditions are met
    if (!this.checkConditions(application, rule.trigger.conditions, metadata)) {
      return application;
    }

    let updatedApplication = { ...application };

    for (const action of rule.actions) {
      switch (action.type) {
        case 'status_change':
          updatedApplication = await this.handleStatusChange(updatedApplication, action.parameters);
          break;
        case 'notification':
          await this.handleNotification(updatedApplication, action.parameters);
          break;
        case 'document_request':
          await this.handleDocumentRequest(updatedApplication, action.parameters);
          break;
        case 'payment_request':
          await this.handlePaymentRequest(updatedApplication, action.parameters);
          break;
      }
    }

    return updatedApplication;
  }

  private static checkConditions(
    application: Application, 
    conditions: Record<string, unknown>, 
    _metadata?: Record<string, unknown>
  ): boolean {
    // Implement condition checking logic
    for (const [key, value] of Object.entries(conditions)) {
      switch (key) {
        case 'statusType':
          if (value === 'stage_completion' && !this.isStageComplete(application)) {
            return false;
          }
          break;
        case 'stage':
          if (application.currentStage !== value) {
            return false;
          }
          break;
        case 'status':
          if (application.currentStatus !== value) {
            return false;
          }
          break;
      }
    }
    return true;
  }

  private static isStageComplete(application: Application): boolean {
    // Define stage completion logic
    const stageCompletionStatuses: Record<number, string[]> = {
      1: ['approved_stage1'],
      2: ['university_approved'],
      3: ['visa_approved'],
      4: ['enrollment_completed'],
      5: ['commission_paid']
    };

    const completionStatuses = stageCompletionStatuses[application.currentStage];
    return completionStatuses?.includes(application.currentStatus) || false;
  }

  private static async handleStatusChange(
    application: Application, 
    parameters: Record<string, unknown>
  ): Promise<Application> {
    // Handle stage transitions
    if (parameters.nextStage && typeof parameters.nextStage === 'number') {
      const newStage = parameters.nextStage as 1 | 2 | 3 | 4 | 5;
      const newStatus = parameters.status as string || WorkflowService.getNextStageStatus(newStage);
      
      if (newStatus && newStage >= 1 && newStage <= 5) {
        return {
          ...application,
          currentStage: newStage,
          currentStatus: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
    }
    
    // Handle automatic stage progression  
    if (parameters.nextStage === true && this.isStageComplete(application)) {
      const nextStage = application.currentStage + 1;
      const nextStatus = WorkflowService.getNextStageStatus(nextStage);
      
      if (nextStatus && nextStage >= 1 && nextStage <= 5) {
        return {
          ...application,
          currentStage: nextStage as 1 | 2 | 3 | 4 | 5,
          currentStatus: nextStatus,
          updatedAt: new Date().toISOString()
        };
      }
    }

    // Handle simple status changes
    if (parameters.status && typeof parameters.status === 'string') {
      return {
        ...application,
        currentStatus: parameters.status,
        updatedAt: new Date().toISOString()
      };
    }

    return application;
  }

  private static async handleNotification(
    application: Application, 
    parameters: Record<string, unknown>
  ): Promise<void> {
    console.log(`Sending notification for application ${application.id}:`, parameters);
    // Implement notification logic
  }

  private static async handleDocumentRequest(
    application: Application, 
    parameters: Record<string, unknown>
  ): Promise<void> {
    console.log(`Processing document request for application ${application.id}:`, parameters);
    // Implement document request logic
  }

  private static async handlePaymentRequest(
    application: Application, 
    parameters: Record<string, unknown>
  ): Promise<void> {
    console.log(`Processing payment request for application ${application.id}:`, parameters);
    // Implement payment request logic
  }

  static getRules(): AutomationRule[] {
    return [...this.rules];
  }

  static addRule(rule: AutomationRule): void {
    this.rules.push(rule);
  }

  static updateRule(id: string, updates: Partial<AutomationRule>): void {
    const index = this.rules.findIndex(rule => rule.id === id);
    if (index !== -1) {
      this.rules[index] = { ...this.rules[index], ...updates };
    }
  }

  static deleteRule(id: string): void {
    this.rules = this.rules.filter(rule => rule.id !== id);
  }

  static toggleRule(id: string, isActive: boolean): void {
    const rule = this.rules.find(r => r.id === id);
    if (rule) {
      rule.isActive = isActive;
    }
  }

  /**
   * Stage 1 Specific Automation Helpers
   */
  static async processStage1StatusChange(application: Application, newStatus: string): Promise<Application> {
    // Check if this status change should trigger system automation
    let updatedApp = { ...application };
    
    // System auto-transitions based on PDF matrix
    switch (newStatus) {
      case 'documents_approved':
        // System can trigger approved_stage1
        updatedApp = await this.processApplication(updatedApp, 'status_changed', {
          actor: 'System',
          currentStatus: newStatus
        });
        break;
        
      case 'approved_stage1':
        // System should move to Stage 2
        updatedApp = await this.processApplication(updatedApp, 'status_changed', {
          actor: 'System', 
          currentStatus: newStatus,
          triggerStageTransition: true
        });
        break;
    }
    
    return updatedApp;
  }

  static async processDocumentUpload(application: Application, uploadComplete: boolean): Promise<Application> {
    if (application.currentStage !== 1) return application;
    
    return await this.processApplication(application, 'documents_uploaded', {
      uploadComplete,
      stage: 1
    });
  }
}