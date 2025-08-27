# UniBexs Application Management System

## Project Overview

UniBexs is a comprehensive application management system for international student admissions and visa processing. The system facilitates the entire student journey from initial application submission through visa approval and student arrival.

### ⚡ Latest Major Update (2025-08-26): Zero-Hardcoded Workflow System

The application now uses a **completely configuration-driven workflow engine** with zero hardcoded logic:

- **🏗️ Workflow Engine**: Pure configuration-driven system for all status logic
- **📝 Copy Manager**: Easy text editing via CSV/JSON without touching code  
- **🔒 Authority Matrix**: Role-based permissions from PDF workflow specification
- **🎯 Multi-Stage Support**: Stage 1 & Stage 2 fully implemented and tested
- **🚀 Scalable Architecture**: Ready for Stage 3-5 implementation

### Key Stakeholders
- **Admin**: System administrators who review applications, manage workflows, and oversee the entire process
- **Partners**: Educational consultants and agencies who submit applications on behalf of students
- **Students**: International students applying for programs (data subjects, not direct users)

### Core Workflow Stages
1. **Stage 1 - Application Review**: Initial document submission and admin review
2. **Stage 2 - University Submission**: Approved applications sent to universities
3. **Stage 3 - Visa Processing**: Visa applications and immigration procedures
4. **Stage 4 - Arrival Management**: Student arrival coordination and verification
5. **Stage 5 - Commission Processing**: Financial settlements and commission payments

---

## Version Control Protocol

### Git Workflow Standards
Every significant change to the system MUST include a git commit with clear, descriptive messages.

#### Commit Message Format
```
[Type]: Brief description

Detailed explanation of changes made
- Key modifications
- Impact on user experience
- Any breaking changes
```

#### Commit Types
- `[FEAT]`: New features or major enhancements
- `[FIX]`: Bug fixes and corrections
- `[UI]`: User interface improvements
- `[DATA]`: Data model or initialization changes
- `[DOCS]`: Documentation updates
- `[REFACTOR]`: Code structure improvements

#### Rolling Back Changes
To revert to a previous version:
```bash
git log --oneline  # View commit history
git reset --hard <commit-hash>  # Reset to specific version
```

---

## Workflow Engine Architecture

### Zero-Hardcoded System Design

The UniBexs workflow system is built on a **pure configuration-driven architecture** that eliminates all hardcoded status logic:

#### Core Components

**1. Workflow Engine** (`src/lib/workflow/workflow-engine.ts`)
- Singleton pattern for consistent workflow state
- Configuration-driven status transitions and permissions
- Role-based text and action management
- Built-in validation and error handling

**2. Configuration System** (`src/lib/workflow/stages/`)
- `stage-1-config.ts`: Complete Stage 1 workflow (11+ statuses)
- `stage-2-config.ts`: Complete Stage 2 workflow (12+ statuses)  
- `types.ts`: TypeScript interfaces for type safety
- `workflow-config.ts`: Combined configuration assembly

**3. Copy Manager** (`src/lib/workflow/copy-manager.ts`)
- Edit any UI text without touching code
- CSV export/import for bulk text changes
- JSON export/import for structured editing
- Version control and audit trail for text changes

**4. Authority Matrix** (`src/lib/workflow/status-authority-matrix.ts`)
- Direct implementation of PDF workflow specification
- Who can update each status (Admin/Partner/System)
- Available transitions for each role
- Permission validation and business rule enforcement

#### Key Benefits

✅ **Zero Hardcoding**: No status logic in UI components  
✅ **Easy Maintenance**: Change text via CSV, not code  
✅ **Type Safety**: Full TypeScript support with strict typing  
✅ **PDF Compliance**: Direct mapping to workflow specification  
✅ **Scalable**: Ready for Stage 3-5 implementation  

#### Usage Example

```typescript
// OLD (Hardcoded):
switch(app.currentStatus) {
  case 'new_application': return 'Review new application...';
  // ... 50+ lines of hardcoded cases
}

// NEW (Configuration-driven):
const role = isAdmin ? 'admin' : 'partner';
return workflowEngine.getText(app.currentStage, app.currentStatus, role, 'primaryMessage');
```

#### Editing Copy/Text

**Via CSV (Bulk editing):**
```typescript
const csvContent = copyManager.exportToCSV();
// Edit in Excel/Google Sheets
const result = copyManager.importFromCSV(editedCsvContent);
```

**Via Code (Individual changes):**
```typescript
copyManager.updateCopy(
  stage: 1, 
  status: 'new_application', 
  role: 'admin', 
  field: 'primaryMessage', 
  newValue: 'Updated message text'
);
```

---

## Data Architecture

### Core Entities

#### Student
Contains comprehensive student information:
- **Personal**: Name (as per passport), nationality, date of birth, passport number
- **Contact**: Email, phone, current/permanent address
- **Support**: Emergency contact, parent/guardian details, sponsor information
- **Academic**: Previous qualifications, English proficiency test results

#### Application
Central entity managing the application workflow:
- **Program Details**: University, program name, intake date, tuition fees
- **Workflow**: Current stage, status, next action required
- **Timeline**: Complete history of status changes and actions
- **References**: Links to student, partner, and related documents

#### Partner
Educational consultants and agencies:
- **Business Info**: Company name, registration details, contact person
- **Contact**: Email, phone, physical address
- **Performance**: Application statistics, success rates, commission details

#### Document
File management for all application documents:
- **Metadata**: Type, stage, mandatory/optional classification
- **Status**: Pending, approved, rejected, resubmission required
- **Versioning**: Support for document updates and resubmissions
- **Review**: Admin feedback and approval workflow

### Document Categories

#### Admission Documents
- Passport copy (bio-data page)
- Academic transcripts and certificates
- English proficiency test results (IELTS/TOEFL)
- Personal statement and motivation letter
- Recommendation letters (2-3)
- Bank statements (financial proof)
- CV/Resume
- Passport-size photographs

#### Specialized Requirements
- **Architecture Programs**: Design portfolio
- **Medicine/Dentistry**: Interview records, additional screening
- **Research Programs**: Research proposal, supervisor correspondence

#### Visa Documents
- University offer letter
- Visa application forms
- Medical examination certificates
- Police clearance certificates
- Financial support documentation
- Travel insurance
- Accommodation booking proof
- Biometric appointment confirmations

#### Country-Specific Requirements
- **Sudan**: Yellow fever certificate
- **Sudan/Oman**: NOC (No Objection Certificate) from embassy
- **All Countries**: Affidavit letter (if passport name differs from academic certificates)

---

## Component Architecture & File Management

### ⚠️ CRITICAL: Active Component Mapping

**BEFORE MAKING ANY CHANGES** - Always verify which components are currently active in production:

#### Application Detail Pages
- **✅ ACTIVE**: `ApplicationDetailsV3.tsx` - Used by both Admin and Partner pages
- **❌ DEPRECATED**: `ApplicationDetails.tsx` (V1) - Legacy version, not used
- **❌ DEPRECATED**: `ApplicationDetailsV2.tsx` - Legacy version, not used

#### Document Management
- **✅ ACTIVE**: `DocumentModule.tsx` - Integrated into ApplicationDetailsV3 (as of 2025-08-26)
- **❌ LIMITED USE**: `DocumentUploadModal.tsx` - Used for specific upload workflows only

#### Routing Structure
```
src/app/partner/applications/[id]/page.tsx → PartnerApplicationDetailsWrapper → ApplicationDetailsV3
src/app/admin/applications/[id]/page.tsx → AdminApplicationDetailsWrapper → ApplicationDetailsV3
```

### Pre-Change Verification Checklist

**Before modifying ANY component**, complete this checklist:

1. **□ Component Usage Check**
   ```bash
   # Find all imports of the component you want to modify
   grep -r "import.*YourComponent" src/
   ```

2. **□ Version Verification**
   ```bash
   # Check which version is actually imported
   grep -r "ApplicationDetails" src/app/
   ```

3. **□ Feature Location Map**
   - **Document Upload Confirmations**: `DocumentModule.tsx` (lines ~865-872)
   - **Admin Action Buttons**: `DocumentModule.tsx` (lines ~1097-1123)
   - **Status Updates**: `StatusUpdateModal.tsx` 
   - **Toast Notifications**: `Toast.tsx` + `layout.tsx` ToastProvider

4. **□ Dependency Chain Check**
   ```bash
   # Trace the full import chain
   # Page → Wrapper → Main Component → Sub Components
   ```

### Change Impact Analysis

Before making changes, document:

1. **Files to Modify**: List all files that need changes
2. **Import Updates**: Note any import statement changes needed
3. **Testing Scope**: Define which user flows need verification
4. **Rollback Plan**: Identify how to revert changes if issues occur

### Component Integration Log

**Document Module Integration (2025-08-26)**:
- **Modified**: `ApplicationDetailsV3.tsx` - Replaced inline document section with `<DocumentModule>`
- **Added Import**: `import DocumentModule from '@/components/documents/DocumentModule';`
- **Removed**: Inline document rendering code (lines 1063-1278)
- **Result**: All DocumentModule features (upload confirmations, admin buttons) now work in V3

### Change Tracking

| Date | Component | Change Type | Impact |
|------|-----------|-------------|---------|
| 2025-08-26 | ApplicationDetailsV3.tsx | Integration | Added DocumentModule, removed inline document code |
| 2025-08-26 | DocumentModule.tsx | Enhancement | Added UploadConfirmationDialog, admin buttons |
| 2025-08-26 | Toast.tsx | New | Global toast notification system |

---

## Development Guidelines

### Design System Rules
The application follows a consistent design system. When making changes:

#### Color Palette
- **Primary**: Blue (#2563eb, #3b82f6)
- **Success**: Green (#059669, #10b981)
- **Warning**: Yellow (#d97706, #f59e0b)
- **Danger**: Red (#dc2626, #ef4444)
- **Neutral**: Gray shades for backgrounds and text

#### Component Patterns
- **Cards**: Use rounded corners and subtle shadows
- **Buttons**: Consistent padding, hover states, and loading indicators
- **Forms**: Clear labels, validation states, and helpful error messages
- **Status Indicators**: Color-coded badges with appropriate icons

#### Information Hierarchy
- **Primary Information**: Large, bold headings
- **Secondary Details**: Medium text with appropriate spacing
- **Metadata**: Small, muted text for timestamps, IDs, etc.
- **Actions**: Clear, actionable buttons with descriptive labels

### UI/UX Principles

#### Data Organization
- Group related information into logical sections
- Use progressive disclosure for detailed information
- Prioritize frequently accessed data
- Provide clear navigation between related entities

#### Status Communication
- Use consistent terminology across all interfaces
- Provide clear next-step indicators
- Show progress through visual indicators
- Communicate waiting states and blocking conditions

#### Responsive Design
- Mobile-first approach for all new components
- Ensure touch-friendly interactive elements
- Maintain readability across all screen sizes
- Optimize loading states for slower connections

---

## Testing & Quality Assurance

### Key User Flows to Verify
1. **Application Submission** (Partner perspective)
   - Create new application
   - Upload required documents
   - Submit for admin review

2. **Application Review** (Admin perspective)
   - Review submitted applications
   - Approve/reject documents
   - Request corrections when needed
   - Progress applications through stages

3. **Status Updates** (Both perspectives)
   - Real-time status synchronization
   - Notification of status changes
   - Clear action requirements

### Testing Checklist
- [ ] Data initialization creates realistic, complete records
- [ ] All document uploads work correctly
- [ ] Status updates reflect immediately across all views
- [ ] Responsive design works on mobile devices
- [ ] Loading states provide clear feedback
- [ ] Error handling provides helpful messages

### Performance Considerations
- Lazy loading for document previews
- Efficient localStorage usage for large datasets
- Optimized re-renders in React components
- Proper cleanup of event listeners

---

## Common Tasks & Solutions

### Adding New Document Types
1. Update the document type enum in types/index.ts
2. Add generation logic in initialize.ts
3. Update UI components to handle new type
4. Test upload and review workflows

### Modifying Status Workflow
1. Update status definitions in workflow files
2. Modify status authority matrix for permissions
3. Update UI status displays and messages
4. Test all state transitions

### Enhancing Student Information
1. Update Student interface in types/index.ts
2. Modify data generation in initialize.ts
3. Update display components to show new fields
4. Ensure responsive design accommodates new content

### Debugging Storage Issues
- Check browser localStorage capacity
- Verify JSON serialization of complex objects
- Monitor storage event propagation
- Clear localStorage and reinitialize if corrupted

### Performance Optimization
- Use React DevTools to identify slow renders
- Implement useMemo for expensive calculations
- Consider virtualization for large lists
- Optimize bundle size with code splitting

---

## Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/             # Reusable UI components
│   ├── applications/       # Application-specific components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard views
│   ├── layout/            # Layout components
│   └── workflow/          # Workflow management components
├── lib/                   # Core business logic
│   ├── auth/              # Authentication services
│   ├── data/              # Data management and storage
│   ├── utils/             # Utility functions
│   └── workflow/          # Workflow management
└── types/                 # TypeScript type definitions
```

---

## Deployment & Environment

### Development Setup
```bash
npm install
npm run dev
```

### Build Process
```bash
npm run build
npm run start
```

### 🔧 Validation & Quality Assurance Commands

**IMPORTANT**: Always run these validation commands before making changes to prevent runtime errors like `TypeError: Cannot read properties of undefined (reading 'urgencyLevel')`.

#### Quick Validation (Recommended for every code session)
```bash
npm run validate:quick
```
Runs TypeScript compilation check + workflow configuration validation

#### Individual Commands
```bash
# TypeScript compilation check (catches type errors)
npm run typecheck

# Workflow configuration validation (catches missing properties)
npm run validate

# ESLint code quality check
npm run lint

# Complete pre-deployment check (all validations)
npm run precheck
```

#### What Each Command Checks

**`npm run typecheck`**:
- TypeScript compilation errors
- Type mismatches and undefined properties
- Missing interface properties

**`npm run validate`**:
- Missing styling properties (prevents urgencyLevel errors)
- Missing rule properties (requiresDocuments, partialSubmission, etc.)
- Missing display sections for admin/partner roles
- Terminal status configuration issues
- Authority matrix completeness

**`npm run lint`**:
- Code style and quality issues
- Unused variables and imports
- React hooks rules compliance

**`npm run precheck`**:
- Runs all validations in sequence
- Must pass before deployment
- Recommended before git commits

#### When to Use These Commands

1. **Before starting any development session**: `npm run validate:quick`
2. **After modifying workflow configurations**: `npm run validate`
3. **Before committing changes**: `npm run precheck`
4. **When encountering runtime TypeErrors**: `npm run typecheck`

### Environment Variables
Configure in `.env.local`:
- Database connection strings (if applicable)
- API keys and secrets
- Feature flags for development

---

## Troubleshooting Guide

### Common Issues

#### Data Not Loading
1. Check localStorage for data corruption
2. Verify initialization service is working
3. Clear storage and reinitialize
4. Check browser console for errors

#### Status Updates Not Syncing
1. Verify storage event listeners are attached
2. Check component lifecycle cleanup
3. Confirm status authority matrix permissions
4. Test cross-tab synchronization

#### Performance Problems
1. Monitor component render cycles
2. Check for memory leaks in event listeners
3. Optimize localStorage operations
4. Consider data pagination

#### UI/UX Issues
1. Test on multiple screen sizes
2. Verify color contrast ratios
3. Check keyboard navigation
4. Validate loading states

---

## Future Enhancements

### Planned Features
- Real-time notifications system
- Advanced search and filtering
- Document OCR and validation
- Integration with external APIs
- Multi-language support
- Advanced analytics and reporting

### Technical Improvements
- Migration to server-side database
- Implement proper authentication system
- Add automated testing suite
- Set up CI/CD pipeline
- Performance monitoring and alerts

---

*Last Updated: [Current Date]*
*This document is maintained as a living resource. Update when making significant changes to the system.*