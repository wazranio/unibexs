# UniBexs Product Information
## Complete Entity Data Dictionary

**Last Updated:** August 27, 2025  
**System:** UniBexs Application Management Platform  
**Purpose:** International student admissions and visa processing workflow management

---

## 1. **User Entity**
**Purpose:** System authentication and access control

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique user identifier | `user-admin-001` |
| `email` | string | Login email address | `admin@unibexs.com` |
| `password` | string | Encrypted password | `$2b$10$...` |
| `role` | enum | System role (`admin` \| `partner`) | `admin` |
| `name` | string | Full display name | `John Administrator` |
| `partnerId` | string? | Linked partner ID (if partner role) | `partner-techcorp-001` |
| `createdAt` | string | Account creation timestamp | `2024-08-27T10:30:00Z` |

---

## 2. **Partner Entity**
**Purpose:** Educational consultants and agencies submitting applications

### Core Information
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique partner identifier | `partner-techcorp-001` |
| `type` | enum | Partner type (`individual` \| `business`) | `business` |
| `name` | string | Partner/company name | `TechCorp Education Partners` |
| `email` | string | Primary contact email | `partner@techcorp.com` |
| `phone` | string | Contact phone number | `+1-555-0123` |
| `country` | string | Operating country | `Malaysia` |
| `status` | enum | Approval status (`pending` \| `approved` \| `rejected`) | `approved` |
| `createdAt` | string | Registration timestamp | `2024-08-27T10:30:00Z` |

### Individual Partner Specific
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `photo` | string? | Profile photo URL | `https://...photo.jpg` |
| `passport` | string? | Passport document URL | `https://...passport.pdf` |

### Business Partner Specific
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `businessName` | string? | Official business name | `TechCorp Education Services Sdn Bhd` |
| `tradingLicense` | string? | Trading license document URL | `https://...license.pdf` |

### Legacy/Analytics Fields
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `address` | string? | Business/residential address | `123 Business District, Tech City` |
| `contactPerson` | string? | Primary contact person name | `Sarah Johnson` |
| `registrationNumber` | string? | Official registration number | `TC-EDU-2024-001` |
| `totalApplications` | number? | Total applications submitted | `25` |
| `successfulPlacements` | number? | Successful student placements | `20` |
| `pendingCommission` | number? | Outstanding commission amount | `5000.00` |

---

## 3. **Student Entity**
**Purpose:** International students applying for programs

### Core Information
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique student identifier | `student-michael-001` |
| `firstName` | string | Student's first name | `Michael` |
| `lastName` | string | Student's last name | `Johnson` |
| `email` | string | Student email address | `michael.johnson@email.com` |
| `phone` | string | Contact phone number | `+1-555-0199` |
| `nationality` | string | Student's nationality | `American` |
| `passportNumber` | string | Passport identification number | `US123456789` |
| `applicationIds` | string[] | Array of linked application IDs | `["APP-2024-001", "APP-2024-002"]` |
| `createdAt` | string | Record creation timestamp | `2024-08-27T10:30:00Z` |

### Additional Information
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `dateOfBirth` | string? | Student's birth date | `1998-03-15` |
| `address` | string? | Current residential address | `456 Student Lane, Hometown, HT 67890` |

### Emergency Contact
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `emergencyContact.name` | string | Emergency contact name | `Robert Johnson` |
| `emergencyContact.phone` | string | Emergency contact phone | `+1-555-0200` |
| `emergencyContact.relationship` | string | Relationship to student | `Father` |

### Academic History
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `academicHistory[].institution` | string | Educational institution name | `Hometown High School` |
| `academicHistory[].degree` | string | Degree/qualification obtained | `High School Diploma` |
| `academicHistory[].startYear` | number | Start year | `2014` |
| `academicHistory[].endYear` | number | End year | `2018` |
| `academicHistory[].gpa` | number | Grade point average | `3.8` |

### English Proficiency
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `englishProficiency.testType` | string | Test type (IELTS/TOEFL) | `TOEFL` |
| `englishProficiency.score` | string | Test score achieved | `95` |
| `englishProficiency.testDate` | string | Test completion date | `2023-06-15` |

---

## 4. **Application Entity**
**Purpose:** Central workflow management for student applications

### Core Workflow Information
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique application identifier | `APP-2024-001` |
| `studentId` | string | Linked student ID | `student-michael-001` |
| `partnerId` | string | Linked partner ID | `partner-techcorp-001` |
| `currentStage` | number | Current workflow stage (1-5) | `1` |
| `currentStatus` | string | Current application status | `new_application` |
| `nextAction` | string? | Required next action | `Admin review required` |
| `nextActor` | enum? | Who needs to act (`Admin` \| `Partner` \| `University` \| `Immigration`) | `Admin` |
| `priority` | enum | Application priority (`low` \| `medium` \| `high`) | `medium` |
| `createdAt` | string | Application creation timestamp | `2024-08-27T10:30:00Z` |
| `updatedAt` | string | Last modification timestamp | `2024-08-27T11:00:00Z` |

### Program Information
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `program` | string | Applied program name | `Computer Science - Bachelor` |
| `university` | string | Target university | `Tech University` |
| `intakeDate` | string | Program intake date | `2024-09-01` |
| `tuitionFee` | number? | Program tuition cost | `25000` |

### Workflow Management
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `trackingNumber` | string? | Official tracking number | `TRK-2024-001` |
| `stageHistory` | StageHistoryEntry[]? | Complete status history | `[{stage: 1, status: "new", ...}]` |
| `rejectionReason` | string? | Reason for rejection | `Insufficient documents` |
| `documentsRequired` | string[]? | Required document types | `["passport", "transcripts"]` |
| `activeDocumentRequest` | string? | Active document request ID | `req-001` |
| `hasActionRequired` | boolean? | Quick action flag for partners | `true` |
| `programChangeId` | string? | Program change request ID | `pc-001` |

### Hold/Resume Functionality
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `previousStatus` | string? | Status before hold | `document_review` |
| `holdReason` | string? | Reason for hold | `Missing documents` |
| `heldBy` | string? | Admin who placed hold | `admin-001` |
| `heldAt` | string? | Hold timestamp | `2024-08-27T12:00:00Z` |
| `resumeReason` | string? | Reason for resume | `Documents received` |
| `resumedBy` | string? | Admin who resumed | `admin-002` |
| `resumedAt` | string? | Resume timestamp | `2024-08-28T09:00:00Z` |

### Cancel Functionality
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `cancelReason` | string? | Cancellation reason | `Student withdrew` |
| `cancelledBy` | string? | Admin who cancelled | `admin-001` |
| `cancelledAt` | string? | Cancellation timestamp | `2024-08-27T15:00:00Z` |

### Enhanced Data
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `documents` | object[]? | Embedded document information | `[{id, name, type, status...}]` |
| `timeline` | object[]? | Application timeline events | `[{stage, status, timestamp...}]` |
| `submittedAt` | string? | Initial submission timestamp | `2024-08-27T10:30:00Z` |
| `metadata` | object? | Additional data storage | `{source: "portal", ref: "TC-001"}` |
| `notes` | string? | General application notes | `Expedited processing requested` |

### Program Change Support
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `appliedProgram` | string? | Original applied program | `Computer Science` |
| `appliedUniversity` | string? | Original university | `Tech University` |
| `studentName` | string? | Student name cache | `Michael Johnson` |
| `studentEmail` | string? | Student email cache | `michael@email.com` |
| `submissionDate` | string? | Submission date cache | `2024-08-27` |

### Program Change Data
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `programChangeData.suggestedUniversity` | string | New suggested university | `Global Tech University` |
| `programChangeData.suggestedProgram` | string | New suggested program | `Software Engineering` |
| `programChangeData.originalProgram` | string | Original program name | `Computer Science` |
| `programChangeData.reason` | string | Change reason | `Better fit for student` |
| `programChangeData.suggestedAt` | string? | Suggestion timestamp | `2024-08-27T14:00:00Z` |
| `programChangeData.suggestedBy` | string? | Who suggested change | `admin-001` |

### Program Change Decision
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `programChangeDecision.decision` | enum | Decision (`accepted` \| `rejected`) | `accepted` |
| `programChangeDecision.decidedAt` | string | Decision timestamp | `2024-08-28T10:00:00Z` |
| `programChangeDecision.decidedBy` | string | Decision maker | `partner-001` |
| `programChangeDecision.reason` | string | Decision reasoning | `Better career prospects` |

---

## 5. **Document Entity**
**Purpose:** File management and verification for applications

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique document identifier | `DOC-APP-2024-001-1` |
| `applicationId` | string | Linked application ID | `APP-2024-001` |
| `stage` | number | Workflow stage (1-5) | `1` |
| `type` | string | Document type | `passport` |
| `fileName` | string | Original file name | `Michael_Johnson_Passport_Copy.pdf` |
| `uploadedAt` | string | Upload timestamp | `2024-08-27T10:30:00Z` |
| `uploadedBy` | string | Uploader name | `John Partner` |
| `status` | enum | Review status (`pending` \| `approved` \| `rejected` \| `resubmission_required`) | `approved` |
| `reviewedBy` | string? | Reviewer name | `System Administrator` |
| `reviewedAt` | string? | Review timestamp | `2024-08-27T12:00:00Z` |
| `rejectionReason` | string? | Rejection explanation | `Blurry image quality` |
| `url` | string? | Document storage URL | `https://storage.../doc.pdf` |
| `version` | number | Document version number | `1` |
| `parentDocumentId` | string? | Previous version ID | `DOC-APP-2024-001-0` |
| `size` | number? | File size in bytes | `1024768` |
| `mimeType` | string? | File MIME type | `application/pdf` |

---

## 6. **Document Request Entity**
**Purpose:** Managing document requests from universities/immigration

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique request identifier | `req-001` |
| `applicationId` | string | Target application ID | `APP-2024-001` |
| `stage` | number | Workflow stage | `2` |
| `requestedBy` | string | Admin making request | `admin-001` |
| `requestedAt` | string | Request timestamp | `2024-08-27T14:00:00Z` |
| `requestSource` | enum | Request source (`Admin` \| `University` \| `Immigration`) | `University` |
| `documents` | DocumentRequirement[] | Required document list | `[{id, type, description...}]` |
| `status` | enum | Request status (`pending` \| `partially_submitted` \| `submitted` \| `approved` \| `rejected`) | `pending` |
| `dueDate` | string? | Submission deadline | `2024-09-01T00:00:00Z` |
| `notes` | string? | Additional instructions | `Please provide certified copies` |

---

## 7. **Document Requirement Entity**
**Purpose:** Individual document requirements within requests

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique requirement identifier | `req-doc-001` |
| `type` | string | Document type required | `academic_transcripts` |
| `description` | string | Detailed description | `Official academic transcripts` |
| `mandatory` | boolean | Required or optional | `true` |
| `status` | enum | Submission status (`pending` \| `uploaded` \| `approved` \| `rejected` \| `resubmission_required`) | `pending` |
| `documentId` | string? | Linked document ID | `DOC-APP-2024-001-2` |
| `rejectionReason` | string? | Rejection explanation | `Not officially certified` |

---

## 8. **Payment Entity**
**Purpose:** Financial transaction tracking

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique payment identifier | `pay-001` |
| `applicationId` | string | Related application ID | `APP-2024-001` |
| `stage` | number | Workflow stage | `3` |
| `type` | enum | Payment type (`visa_fee` \| `student_payment`) | `visa_fee` |
| `amount` | number | Payment amount | `350.00` |
| `currency` | string | Currency code | `USD` |
| `proofDocument` | string | Proof document ID | `DOC-PAY-001` |
| `status` | enum | Payment status (`pending` \| `approved` \| `rejected`) | `approved` |
| `submittedAt` | string | Submission timestamp | `2024-08-27T16:00:00Z` |
| `processedAt` | string? | Processing timestamp | `2024-08-28T09:00:00Z` |
| `processedBy` | string? | Processor name | `admin-001` |

---

## 9. **Visa Record Entity**
**Purpose:** Visa application and status tracking

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique visa record identifier | `visa-001` |
| `applicationId` | string | Related application ID | `APP-2024-001` |
| `trackingNumber` | string | Official visa tracking number | `VISA-TRK-2024-001` |
| `visaNumber` | string? | Issued visa number | `VISA-12345678` |
| `issuedAt` | string? | Visa issuance date | `2024-09-15T10:00:00Z` |
| `expiryDate` | string? | Visa expiration date | `2026-09-15T23:59:59Z` |
| `status` | enum | Visa status (`submitted` \| `approved` \| `rejected`) | `approved` |
| `rejectionReason` | string? | Rejection explanation | `Insufficient financial proof` |

---

## 10. **Arrival Record Entity**
**Purpose:** Student arrival coordination and verification

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique arrival record identifier | `arrival-001` |
| `applicationId` | string | Related application ID | `APP-2024-001` |
| `plannedArrivalDate` | string | Expected arrival date | `2024-09-01T14:00:00Z` |
| `actualArrivalDate` | string? | Actual arrival date | `2024-09-01T16:30:00Z` |
| `status` | enum | Arrival status (`planned` \| `confirmed` \| `verified`) | `verified` |
| `verifiedBy` | string? | Who verified arrival | `admin-001` |
| `verifiedAt` | string? | Verification timestamp | `2024-09-02T09:00:00Z` |

---

## 11. **Commission Entity**
**Purpose:** Partner commission tracking and payment

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique commission identifier | `comm-001` |
| `applicationId` | string | Related application ID | `APP-2024-001` |
| `amount` | number | Commission amount | `2500.00` |
| `currency` | string | Currency code | `USD` |
| `status` | enum | Commission status (`pending` \| `approved` \| `paid` \| `disputed`) | `approved` |
| `approvedAt` | string? | Approval timestamp | `2024-09-15T10:00:00Z` |
| `paidAt` | string? | Payment timestamp | `2024-09-20T14:30:00Z` |
| `disputeReason` | string? | Dispute explanation | `Incorrect commission rate` |

---

## 12. **Comment Entity**
**Purpose:** Communication and notes on applications

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique comment identifier | `comment-001` |
| `applicationId` | string | Related application ID | `APP-2024-001` |
| `stage` | number | Workflow stage | `1` |
| `author` | string | Comment author name | `John Administrator` |
| `authorRole` | enum | Author role (`admin` \| `partner`) | `admin` |
| `content` | string | Comment text | `Documents look good, proceeding to next stage` |
| `isInternal` | boolean | Internal admin note or visible to partner | `false` |
| `createdAt` | string | Comment timestamp | `2024-08-27T15:00:00Z` |
| `parentId` | string? | Parent comment ID for replies | `comment-000` |

---

## 13. **University Entity**
**Purpose:** Educational institution information

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique university identifier | `univ-tech-001` |
| `name` | string | University name | `Tech University` |
| `type` | enum | Institution type (`university` \| `college`) | `university` |
| `country` | string | Location country | `Malaysia` |
| `logo` | string? | University logo URL | `https://storage.../logo.png` |
| `createdAt` | string | Record creation timestamp | `2024-08-27T10:00:00Z` |

---

## 14. **College Entity**
**Purpose:** Colleges/faculties within universities

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique college identifier | `college-eng-001` |
| `universityId` | string | Parent university ID | `univ-tech-001` |
| `name` | string | College name | `Faculty of Engineering` |
| `createdAt` | string | Record creation timestamp | `2024-08-27T10:00:00Z` |

---

## 15. **Program Entity**
**Purpose:** Academic programs offered by universities

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique program identifier | `prog-cs-bach-001` |
| `universityId` | string | Parent university ID | `univ-tech-001` |
| `collegeId` | string? | Parent college ID | `college-eng-001` |
| `name` | string | Program name | `Computer Science - Bachelor` |
| `duration` | string | Program duration | `4 years` |
| `fees` | number | Tuition fees | `25000` |
| `currency` | string | Fee currency | `MYR` |
| `intakes` | string[] | Available intake periods | `["September", "January"]` |
| `requirements` | string[]? | Entry requirements | `["High school diploma", "IELTS 6.0"]` |
| `createdAt` | string | Record creation timestamp | `2024-08-27T10:00:00Z` |

---

## 16. **Logistics Partner Entity**
**Purpose:** Local service providers for student support

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique logistics partner identifier | `logistics-001` |
| `name` | string | Company name | `KL Student Services` |
| `city` | string | Operating city | `Kuala Lumpur` |
| `country` | string | Operating country | `Malaysia` |
| `phone` | string | Contact phone | `+60-3-1234-5678` |
| `email` | string | Contact email | `info@klstudentservices.com` |
| `services` | string[] | Services offered | `["Airport pickup", "Accommodation", "Banking"]` |
| `description` | string? | Company description | `Full-service student support in KL area` |
| `createdAt` | string | Record creation timestamp | `2024-08-27T10:00:00Z` |

---

## 17. **Service Provider Entity**
**Purpose:** Categorized service providers for students

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique service provider identifier | `service-001` |
| `name` | string | Provider name | `Global Student Insurance` |
| `type` | enum | Service category (`accommodation` \| `transport` \| `insurance` \| `medical` \| `banking` \| `other`) | `insurance` |
| `contactEmail` | string | Contact email | `contact@globalstudentins.com` |
| `contactPhone` | string | Contact phone | `+1-800-123-4567` |
| `country` | string | Operating country | `Malaysia` |
| `services` | string[] | Specific services | `["Health insurance", "Travel insurance"]` |
| `description` | string? | Provider description | `Comprehensive insurance for international students` |
| `createdAt` | string | Record creation timestamp | `2024-08-27T10:00:00Z` |

---

## 18. **Analytics Entities**
**Purpose:** Dashboard statistics and reporting

### Partner Analytics
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `total` | number | Total partners | `50` |
| `pending` | number | Pending approval | `5` |
| `approved` | number | Approved partners | `42` |
| `rejected` | number | Rejected partners | `3` |

### Student Analytics
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `total` | number | Total students | `200` |
| `active` | number | Active students | `180` |
| `countries` | number | Unique countries | `25` |
| `programs` | number | Unique programs | `15` |

### University Analytics
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `totalUniversities` | number | Total universities | `10` |
| `totalColleges` | number | Total colleges | `35` |
| `totalPrograms` | number | Total programs | `150` |
| `countries` | number | University countries | `5` |

### Service Analytics
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `total` | number | Total service providers | `25` |
| `byType` | object | Services by category | `{"accommodation": 8, "transport": 5}` |

---

## 19. **Workflow System Entities**

### Stage History Entry
**Purpose:** Tracking application status changes

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `stage` | number | Workflow stage | `1` |
| `status` | string | Status at time | `new_application` |
| `timestamp` | string | Change timestamp | `2024-08-27T10:30:00Z` |
| `actor` | string | Who made change | `Partner` |
| `reason` | string? | Change reason | `Initial submission` |
| `documents` | string[]? | Related document IDs | `["DOC-001", "DOC-002"]` |
| `notes` | string? | Additional notes | `All required documents provided` |

### Workflow Stage
**Purpose:** Stage configuration

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `stage` | number | Stage number | `1` |
| `name` | string | Stage name | `Application Review` |
| `description` | string | Stage description | `Initial document review and validation` |
| `statuses` | WorkflowStatus[] | Available statuses | `[{key: "new", name: "New Application"...}]` |

### Workflow Status
**Purpose:** Status configuration and rules

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `key` | string | Status identifier | `new_application` |
| `name` | string | Display name | `New Application` |
| `description` | string | Status description | `Application submitted and awaiting review` |
| `nextAction` | string | Required action | `Admin review required` |
| `nextActor` | enum | Who should act | `Admin` |
| `canTransitionTo` | string[] | Allowed next statuses | `["under_review", "rejected"]` |
| `requiresReason` | boolean? | Requires reason for transition | `false` |
| `requiresDocuments` | string[]? | Required document types | `["passport", "transcripts"]` |
| `allowedVerbs` | string[]? | UI action verbs | `["approve", "reject"]` |
| `preconditions` | string[]? | Transition preconditions | `["all_documents_approved"]` |
| `inputs` | string[]? | Required user inputs | `["reason", "notes"]` |
| `validationRules` | string[]? | Validation requirements | `["documents_complete"]` |
| `statusTransition` | string? | Transition logic | `auto_progress` |
| `notifications` | object[]? | Notification templates | `[{to: "partner", template: "approved"}]` |
| `auditLog` | object? | Audit log configuration | `{event: "status_change", fields: ["reason"]}` |

---

## 20. **Audit and System Entities**

### Audit Log Entry
**Purpose:** System activity tracking

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique audit entry ID | `audit-001` |
| `applicationId` | string | Related application ID | `APP-2024-001` |
| `event` | string | Event type | `status_change` |
| `action` | string | Specific action | `Application approved` |
| `actor` | string | Who performed action | `admin-001` |
| `actorRole` | enum | Actor role (`admin` \| `partner` \| `university` \| `immigration`) | `admin` |
| `timestamp` | string | Action timestamp | `2024-08-27T15:00:00Z` |
| `previousStatus` | string? | Status before change | `under_review` |
| `newStatus` | string? | Status after change | `approved` |
| `stage` | number? | Workflow stage | `1` |
| `reason` | string? | Action reason | `All documents verified` |
| `trackingNumber` | string? | Related tracking number | `TRK-2024-001` |
| `visaNumber` | string? | Related visa number | `VISA-12345678` |
| `documents` | string[]? | Related document IDs | `["DOC-001", "DOC-002"]` |
| `details` | object? | Additional details | `{ip: "192.168.1.1", browser: "Chrome"}` |

### Dashboard Stats
**Purpose:** System overview statistics

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `totalApplications` | number | Total applications | `100` |
| `pendingReview` | number | Applications pending review | `15` |
| `approved` | number | Approved applications | `70` |
| `rejected` | number | Rejected applications | `10` |
| `byStage` | object | Applications by stage | `{1: 20, 2: 30, 3: 25, 4: 15, 5: 10}` |
| `byStatus` | object | Applications by status | `{"new": 5, "approved": 70, "rejected": 10}` |
| `recentActivity` | AuditLogEntry[] | Recent system activity | `[{id: "audit-001", ...}]` |

### Auth Session
**Purpose:** User authentication sessions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `user` | User | User object | `{id: "user-001", name: "John", ...}` |
| `token` | string | Session token | `jwt.token.here` |
| `expiresAt` | string | Session expiry | `2024-08-28T10:30:00Z` |

---

## 21. **Data Transfer Objects**

### Document Request Data
**Purpose:** Document request form data

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `documentType` | string | Type of document requested | `academic_transcripts` |
| `reason` | string | Reason for request | `University requires certified copies` |
| `applicationId` | string | Target application | `APP-2024-001` |

### File Upload Data
**Purpose:** File upload form data

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `files` | FileList | Uploaded files | `[File objects]` |
| `uploadType` | string | Upload category | `passport` |
| `notes` | string | Upload notes | `High resolution scan` |
| `applicationId` | string | Target application | `APP-2024-001` |

### Program Change Data
**Purpose:** Program change request data

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `newProgram` | string | New program name | `Software Engineering` |
| `reason` | string | Change reason | `Better career prospects` |
| `applicationId` | string | Target application | `APP-2024-001` |

### Program Decision Data
**Purpose:** Program change decision data

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `decision` | enum | Decision (`accept` \| `reject`) | `accept` |
| `reason` | string | Decision reason | `Agreed with recommendation` |
| `suggestedProgram` | string? | Alternative suggestion | `Data Science` |
| `applicationId` | string | Target application | `APP-2024-001` |

---

## System Relationships

### Primary Entity Relationships
- **User** ↔ **Partner** (via `partnerId`)
- **Partner** → **Application** (via `partnerId`)  
- **Student** → **Application** (via `studentId`)
- **Application** → **Document** (via `applicationId`)
- **Application** → **Payment** (via `applicationId`)
- **Application** → **VisaRecord** (via `applicationId`)
- **Application** → **ArrivalRecord** (via `applicationId`)
- **Application** → **Commission** (via `applicationId`)
- **Application** → **Comment** (via `applicationId`)
- **University** → **College** (via `universityId`)
- **University** → **Program** (via `universityId`)
- **College** → **Program** (via `collegeId`)

### Workflow Relationships  
- **Application** → **StageHistoryEntry** (embedded array)
- **WorkflowStage** → **WorkflowStatus** (embedded array)
- **DocumentRequest** → **DocumentRequirement** (embedded array)
- **DocumentRequirement** → **Document** (via `documentId`)

---

**Note:** This document represents the complete data model for the UniBexs platform as of August 2025. All entities support the international student application workflow from initial submission through visa approval and student arrival.