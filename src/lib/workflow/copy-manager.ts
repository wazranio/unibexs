/**
 * Copy Manager for Easy Text Modifications
 * 
 * This service allows easy editing of all workflow text without touching code.
 * Supports JSON file editing, CSV export/import, and runtime updates.
 */

import { WorkflowEngine } from './workflow-engine';
import { 
  CopyUpdate, 
  UserRole, 
  StatusDisplay, 
  WorkflowConfiguration 
} from './stages/types';

export interface CopyExport {
  stage: number;
  status: string;
  role: UserRole;
  field: string;
  currentValue: string;
  description: string;
  lastUpdated: string;
}

export interface CopyImport {
  stage: number;
  status: string;
  role: UserRole;
  field: string;
  newValue: string;
}

export class CopyManager {
  private engine: WorkflowEngine;
  private updateHistory: CopyUpdate[] = [];

  constructor(engine: WorkflowEngine) {
    this.engine = engine;
  }

  /**
   * Update a single piece of copy text
   */
  updateCopy(
    stage: number,
    status: string,
    role: UserRole,
    field: keyof StatusDisplay['allText'],
    newValue: string,
    updatedBy: string = 'system'
  ): boolean {
    try {
      const config = this.engine.getStatusConfig(stage, status);
      if (!config) {
        console.error(`Status config not found: stage ${stage}, status ${status}`);
        return false;
      }

      const fieldValue = config.display[role].allText[field];
      const oldValue = Array.isArray(fieldValue) ? fieldValue.join(', ') : (fieldValue || '');
      
      // Update the configuration
      // @ts-expect-error - Complex type intersection issue with workflow configuration
      config.display[role].allText[field] = newValue;
      config.lastUpdated = new Date().toISOString();

      // Record the update
      const updateRecord: CopyUpdate = {
        stage,
        status,
        role,
        field: field as string,
        oldValue,
        newValue,
        updatedBy,
        updatedAt: new Date().toISOString()
      };

      this.updateHistory.push(updateRecord);

      console.log(`Copy updated: ${stage}.${status}.${role}.${field}`);
      return true;
    } catch (error) {
      console.error('Error updating copy:', error);
      return false;
    }
  }

  /**
   * Batch update multiple copy fields
   */
  updateMultipleCopy(updates: CopyImport[], updatedBy: string = 'system'): {
    success: number;
    failed: number;
    errors: string[];
  } {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const update of updates) {
      const result = this.updateCopy(
        update.stage,
        update.status,
        update.role,
        update.field as keyof StatusDisplay['allText'],
        update.newValue,
        updatedBy
      );

      if (result) {
        success++;
      } else {
        failed++;
        errors.push(`Failed to update: ${update.stage}.${update.status}.${update.role}.${update.field}`);
      }
    }

    return { success, failed, errors };
  }

  /**
   * Get current copy value
   */
  getCopy(
    stage: number,
    status: string,
    role: UserRole,
    field: keyof StatusDisplay['allText']
  ): string {
    return this.engine.getText(stage, status, role, field);
  }

  /**
   * Export all copy to CSV format
   */
  exportToCSV(): string {
    const exports: CopyExport[] = [];
    const config = (this.engine as any).config as WorkflowConfiguration;

    // Iterate through all stages, statuses, roles, and fields
    for (const [stageNum, stageConfig] of Object.entries(config.stages)) {
      const stage = parseInt(stageNum);
      
      for (const [statusKey, statusConfig] of Object.entries(stageConfig.statuses)) {
        for (const role of ['admin', 'partner'] as UserRole[]) {
          const display = statusConfig.display[role];
          
          for (const [field, value] of Object.entries(display.allText)) {
            if (value !== null && value !== undefined) {
              exports.push({
                stage,
                status: statusKey,
                role,
                field,
                currentValue: String(value),
                description: `${stageConfig.stageName} - ${statusKey} - ${role} - ${field}`,
                lastUpdated: statusConfig.lastUpdated
              });
            }
          }
        }
      }
    }

    // Convert to CSV
    const headers = ['stage', 'status', 'role', 'field', 'currentValue', 'description', 'lastUpdated'];
    const csvRows = [headers.join(',')];

    for (const item of exports) {
      const row = [
        item.stage,
        item.status,
        item.role,
        item.field,
        `"${item.currentValue.replace(/"/g, '""')}"`, // Escape quotes
        `"${item.description.replace(/"/g, '""')}"`,
        item.lastUpdated
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Import copy from CSV content
   */
  importFromCSV(csvContent: string, updatedBy: string = 'csv_import'): {
    success: number;
    failed: number;
    errors: string[];
  } {
    try {
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',');
      
      // Find required column indices
      const stageIdx = headers.indexOf('stage');
      const statusIdx = headers.indexOf('status');
      const roleIdx = headers.indexOf('role');
      const fieldIdx = headers.indexOf('field');
      const valueIdx = headers.indexOf('currentValue');

      if (stageIdx === -1 || statusIdx === -1 || roleIdx === -1 || fieldIdx === -1 || valueIdx === -1) {
        throw new Error('CSV must contain columns: stage, status, role, field, currentValue');
      }

      const updates: CopyImport[] = [];

      // Parse each row
      for (let i = 1; i < lines.length; i++) {
        const columns = this.parseCSVRow(lines[i]);
        
        if (columns.length < Math.max(stageIdx, statusIdx, roleIdx, fieldIdx, valueIdx) + 1) {
          continue; // Skip malformed rows
        }

        updates.push({
          stage: parseInt(columns[stageIdx]),
          status: columns[statusIdx],
          role: columns[roleIdx] as UserRole,
          field: columns[fieldIdx],
          newValue: this.cleanCSVValue(columns[valueIdx])
        });
      }

      return this.updateMultipleCopy(updates, updatedBy);
    } catch (error) {
      return {
        success: 0,
        failed: 1,
        errors: [`CSV import failed: ${error}`]
      };
    }
  }

  /**
   * Parse CSV row handling quoted values
   */
  private parseCSVRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < row.length) {
      const char = row[i];
      
      if (char === '"' && !inQuotes) {
        inQuotes = true;
      } else if (char === '"' && inQuotes) {
        if (i + 1 < row.length && row[i + 1] === '"') {
          current += '"'; // Escaped quote
          i++; // Skip next quote
        } else {
          inQuotes = false;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
      
      i++;
    }
    
    result.push(current);
    return result;
  }

  /**
   * Clean CSV value (remove surrounding quotes)
   */
  private cleanCSVValue(value: string): string {
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1).replace(/""/g, '"');
    }
    return value;
  }

  /**
   * Export copy for a specific stage
   */
  exportStageToJSON(stage: number): object | null {
    const config = (this.engine as any).config as WorkflowConfiguration;
    const stageConfig = config.stages[stage];
    
    if (!stageConfig) return null;

    const result: any = {
      stage: stage,
      stageName: stageConfig.stageName,
      lastUpdated: new Date().toISOString(),
      statuses: {}
    };

    for (const [statusKey, statusConfig] of Object.entries(stageConfig.statuses)) {
      result.statuses[statusKey] = {
        admin: statusConfig.display.admin.allText,
        partner: statusConfig.display.partner.allText,
        lastUpdated: statusConfig.lastUpdated
      };
    }

    return result;
  }

  /**
   * Import copy from JSON for a specific stage
   */
  importStageFromJSON(jsonContent: object, updatedBy: string = 'json_import'): {
    success: number;
    failed: number;
    errors: string[];
  } {
    try {
      const data = jsonContent as any;
      const stage = data.stage;
      const updates: CopyImport[] = [];

      for (const [statusKey, statusData] of Object.entries(data.statuses)) {
        for (const role of ['admin', 'partner'] as UserRole[]) {
          const roleData = (statusData as any)[role];
          
          if (roleData) {
            for (const [field, value] of Object.entries(roleData)) {
              updates.push({
                stage,
                status: statusKey,
                role,
                field,
                newValue: String(value)
              });
            }
          }
        }
      }

      return this.updateMultipleCopy(updates, updatedBy);
    } catch (error) {
      return {
        success: 0,
        failed: 1,
        errors: [`JSON import failed: ${error}`]
      };
    }
  }

  /**
   * Get update history
   */
  getUpdateHistory(limit: number = 50): CopyUpdate[] {
    return this.updateHistory
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }

  /**
   * Search copy by text content
   */
  searchCopy(searchTerm: string, caseSensitive: boolean = false): CopyExport[] {
    const results: CopyExport[] = [];
    const config = (this.engine as any).config as WorkflowConfiguration;
    const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();

    for (const [stageNum, stageConfig] of Object.entries(config.stages)) {
      const stage = parseInt(stageNum);
      
      for (const [statusKey, statusConfig] of Object.entries(stageConfig.statuses)) {
        for (const role of ['admin', 'partner'] as UserRole[]) {
          const display = statusConfig.display[role];
          
          for (const [field, value] of Object.entries(display.allText)) {
            if (value !== null && value !== undefined) {
              const searchValue = caseSensitive ? String(value) : String(value).toLowerCase();
              
              if (searchValue.includes(term)) {
                results.push({
                  stage,
                  status: statusKey,
                  role,
                  field,
                  currentValue: String(value),
                  description: `${stageConfig.stageName} - ${statusKey} - ${role} - ${field}`,
                  lastUpdated: statusConfig.lastUpdated
                });
              }
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Validate copy consistency across roles
   */
  validateCopyConsistency(): {
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];
    const config = (this.engine as any).config as WorkflowConfiguration;

    for (const [stageNum, stageConfig] of Object.entries(config.stages)) {
      const stage = parseInt(stageNum);
      
      for (const [statusKey, statusConfig] of Object.entries(stageConfig.statuses)) {
        const adminText = statusConfig.display.admin.allText;
        const partnerText = statusConfig.display.partner.allText;

        // Check for missing required fields
        const requiredFields = ['statusCard', 'primaryMessage', 'heroCardTitle', 'timelineTitle'];
        
        for (const field of requiredFields) {
          if (!adminText[field as keyof typeof adminText]) {
            issues.push(`Missing admin.${field} for ${stage}.${statusKey}`);
          }
          if (!partnerText[field as keyof typeof partnerText]) {
            issues.push(`Missing partner.${field} for ${stage}.${statusKey}`);
          }
        }

        // Check for extremely long text that might break UI
        for (const [role, text] of [['admin', adminText], ['partner', partnerText]]) {
          for (const [field, value] of Object.entries(text)) {
            if (typeof value === 'string' && value.length > 200) {
              warnings.push(`Long text (${value.length} chars) in ${role}.${field} for ${stage}.${statusKey}`);
            }
          }
        }
      }
    }

    return { issues, warnings };
  }

  /**
   * Create a copy template for new status
   */
  createStatusTemplate(statusKey: string): {
    admin: StatusDisplay['allText'];
    partner: StatusDisplay['allText'];
  } {
    const templateText = statusKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return {
      admin: {
        statusCard: `Admin: ${templateText}`,
        primaryMessage: `Admin message for ${templateText}`,
        secondaryMessage: `Secondary admin message`,
        dashboardTitle: templateText,
        dashboardSubtitle: 'Admin View',
        listViewStatus: templateText,
        heroCardTitle: templateText,
        heroCardSubtitle: 'Admin Action Required',
        heroCardDescription: `Admin description for ${templateText}`,
        timelineTitle: templateText,
        timelineDescription: `Timeline entry for ${templateText}`,
        actionButtonText: 'Take Action',
        actionButtonSecondary: 'View Details',
        successMessage: 'Action completed successfully',
        errorMessage: 'Failed to complete action',
        warningMessage: 'Please review before proceeding',
        infoMessage: 'Additional information available',
        emptyStateTitle: 'No Data Available',
        emptyStateDescription: 'Information will appear here when available',
        loadingMessage: 'Loading...',
        nextStepsTitle: 'Next Steps',
        nextSteps: ['Review status', 'Take appropriate action'],
        estimatedTime: 'To be determined',
        urgencyText: 'Standard priority'
      },
      partner: {
        statusCard: `Partner: ${templateText}`,
        primaryMessage: `Partner message for ${templateText}`,
        secondaryMessage: `Secondary partner message`,
        dashboardTitle: templateText,
        dashboardSubtitle: 'Partner View',
        listViewStatus: templateText,
        heroCardTitle: templateText,
        heroCardSubtitle: 'Status Update',
        heroCardDescription: `Partner description for ${templateText}`,
        timelineTitle: templateText,
        timelineDescription: `Your application status: ${templateText}`,
        actionButtonText: 'Continue',
        successMessage: 'Status updated successfully',
        errorMessage: 'Unable to update status',
        infoMessage: 'Please wait for updates',
        emptyStateTitle: 'Processing',
        emptyStateDescription: 'Your request is being processed',
        loadingMessage: 'Loading your information...',
        nextStepsTitle: 'What Happens Next',
        nextSteps: ['Wait for updates', 'Check back later'],
        estimatedTime: 'Processing time varies',
        urgencyText: 'Please wait'
      }
    };
  }
}

// Export utility functions
export const copyUtils = {
  /**
   * Download CSV content as file
   */
  downloadCSV: (csvContent: string, filename: string = 'workflow-copy.csv') => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  /**
   * Read file content (for CSV import)
   */
  readFileContent: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
};