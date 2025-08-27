# Workflow Stage Scenarios - Detailed Baby Steps

This document describes what happens at each stage of the application workflow, step by step, from the perspective of both admins and partners.

## Table of Contents
- [Initial Application Submission (ChatGPT to System)](#initial-application-submission-chatgpt-to-system)
- [Stage 1: Partner Application Submission (Pre-University Review)](#stage-1-partner-application-submission-pre-university-review)
- [Stage 2: Offer Letter Stage](#stage-2-offer-letter-stage)
- [Stage 3: Visa Processing](#stage-3-visa-processing)
- [Stage 4: Student Arrival & Enrollment](#stage-4-student-arrival--enrollment)
- [Stage 5: Partner Commission](#stage-5-partner-commission)

---

## Initial Application Submission (ChatGPT to System)

### What Happens (Baby Steps)

1. **Student Interaction with Partner via WhatsApp/ChatGPT**
   - Student contacts partner organization through WhatsApp
   - Partner's ChatGPT bot collects initial student information
   - ChatGPT bot creates a structured application record
   - System generates unique Application ID (e.g., "UNI2024-001")

2. **System Creates Application Record**
   - New application is created with status: `new_application`
   - Student record is created with collected information
   - Application is assigned to the partner organization
   - System sets currentStage = 1, currentStatus = "new_application"

3. **Admin Notification**
   - System sends notification to admin team
   - Admin dashboard shows new application in "Action Required" section
   - Application appears in applications list with HIGH priority flag

4. **Partner Dashboard Update**
   - Partner can see the new application in their dashboard
   - Status shows "New Application - Waiting for Admin Review"
   - Partner can view application details but cannot modify status yet

---

## Stage 1: Partner Application Submission (Pre-University Review)

### Status: `new_application` → `under_review_admin`

#### Admin Actions:
1. **Admin logs into system**
   - Opens Applications List page
   - Sees new application with "Action Required" badge
   - Application shows: Student name, Partner organization, Priority level

2. **Admin clicks "View Details" on application**
   - Opens Application Details page
   - Sees big blue "Action Required" panel at top
   - Panel says: "New application submitted. Begin your review of the application and documents."

3. **Admin reviews application information**
   - Reviews Student Information card (name, email, nationality, passport, etc.)
   - Reviews Application Details card (program, university, intake date, tuition fee)
   - Reviews Partner Organization card (partner name, contact person)

4. **Admin clicks "Update Status" button**
   - Modal opens with available status options
   - Admin selects "Under Review by Admin"
   - Admin can add optional notes
   - Admin clicks "Update Status"

5. **System Updates Application**
   - Status changes to `under_review_admin`
   - Audit log entry created
   - Partner receives notification

#### Partner Experience:
1. **Partner sees status update**
   - Dashboard shows application status changed to "Under Review by Admin"
   - Status explanation: "The admin is currently reviewing your application and will make a decision soon. No action required from you at this time."

### Status: `under_review_admin` → Decision Point

#### Admin Review Process:
1. **Admin reviews all documents and information**
   - Checks completeness of student information
   - Verifies program and university details
   - Reviews uploaded documents (if any)

2. **Admin makes decision by clicking "Update Status"**
   - **Option A**: Select "Approved" → Goes to `approved_stage1`
   - **Option B**: Select "Rejected" → Goes to `rejected_stage1` (requires reason)
   - **Option C**: Select "Request Corrections" → Goes to `correction_requested_admin`

### Scenario A: Admin Approves (`approved_stage1`)

#### Admin Actions:
1. **Admin selects "Approved"**
   - Modal shows "Approve Application" form
   - Admin adds approval notes (optional)
   - Admin clicks "Approve Application"

2. **System processes approval**
   - Status changes to `approved_stage1`
   - System prepares for university submission
   - NextAction becomes "Prepare & submit to University"
   - NextActor remains "Admin"

#### Partner Experience:
1. **Partner receives approval notification**
   - Dashboard shows "Approved - Ready for University Submission"
   - Status explanation: "Congratulations! Your application has been approved and will now be sent to the university for their review."
   - No action required from partner

#### Admin Next Steps:
1. **Admin prepares university submission**
   - Gathers all approved documents
   - Creates submission package
   - Updates status to `sent_to_university`
   - **Application moves to Stage 2**

### Scenario B: Admin Requests Corrections (`correction_requested_admin`)

#### Admin Actions:
1. **Admin selects "Request Corrections"**
   - Modal shows "Request Corrections" form
   - Admin specifies what corrections are needed
   - Admin can request specific documents
   - System creates DocumentRequest record
   - Admin clicks "Request Corrections"

#### System Actions:
1. **System creates document request**
   - DocumentRequest is created with specific requirements
   - Status changes to `correction_requested_admin`
   - NextActor changes to "Partner"
   - Notification sent to partner

#### Partner Experience:
1. **Partner sees correction request**
   - Dashboard shows "Correction Requested by Admin"
   - Status explanation: "The admin has reviewed your application and needs additional documents before processing can continue. Please upload the requested documents."
   - Big blue "Action Required" panel shows
   - Panel says: "Admin has requested specific documents for your application. You need to upload X document(s)."

2. **Partner clicks "Upload Required Documents"**
   - Navigates to Documents tab
   - Sees list of required documents with clear descriptions
   - Upload interface shows for each required document

3. **Partner uploads documents**
   - Selects files and uploads them
   - System validates file formats and names
   - As each document uploads, status updates to show progress

4. **Documents submission scenarios**:
   - **All uploaded**: Status changes to `documents_submitted`
   - **Some uploaded**: Status changes to `documents_partially_submitted`

### Document Review Process (`documents_submitted` → `documents_under_review`)

#### Admin Document Review:
1. **Admin sees documents submitted notification**
   - Application status shows "Documents Submitted"
   - Admin clicks "Update Status" → "Start Document Review"
   - Status changes to `documents_under_review`

2. **Admin reviews each document**
   - Documents tab shows all uploaded files
   - Admin can download and review each document
   - For each document, admin can: Approve, Reject, Request Resubmission

3. **Admin completes review and makes decision**:
   - **All Approved**: Status → `documents_approved`
   - **Some/All Rejected**: Status → `documents_rejected` (process ends)
   - **Some need resubmission**: Status → `documents_resubmission_required`

### Scenario C: Admin Rejects (`rejected_stage1`)

#### Admin Actions:
1. **Admin selects "Rejected"**
   - Modal shows "Reject Application" form
   - Admin MUST provide detailed rejection reason (minimum 10 characters)
   - Admin clicks "Reject Application"

#### System Actions:
1. **System processes rejection**
   - Status changes to `rejected_stage1`
   - Rejection reason is stored
   - Process ends (no further transitions available)
   - Notifications sent to both admin and partner

#### Partner Experience:
1. **Partner receives rejection notification**
   - Dashboard shows "Application Rejected"
   - Status explanation: "Unfortunately, the submitted documents have been rejected and your application cannot proceed at this time."
   - Detailed rejection reason is displayed
   - No further actions available

---

## Stage 2: Offer Letter Stage

### Entry Point: `sent_to_university` (From Stage 1)

#### Admin Transition to Stage 2:
1. **Admin finalizes Stage 1**
   - From `approved_stage1`, admin clicks "Update Status"
   - Selects "Send to University"
   - Status changes to `sent_to_university`
   - **Application moves to Stage 2**
   - NextActor changes to "University"

#### What Both Users See:
- **Admin Dashboard**: "Sent to University - Awaiting university decision"
- **Partner Dashboard**: "Your application has been forwarded to the university. They will review it and make their decision."

### University Review Process

The university (represented by admin actions on behalf of university) has several options:

### Scenario A: University Approves (`university_approved`)

#### Admin (acting for University):
1. **University makes approval decision**
   - Admin receives university approval notification
   - Admin updates status to `university_approved`
   - Admin uploads offer letter document

2. **System processes university approval**
   - Status changes to `university_approved`
   - NextAction: "Upload & record Offer Letter; close Stage 2"
   - System prepares to move to Stage 3

#### Admin Next Steps:
1. **Admin records offer letter**
   - Uploads official offer letter document
   - Updates status to `offer_letter_issued`
   - **Application moves to Stage 3**

### Scenario B: University Requests Corrections (`university_requested_corrections`)

#### University Correction Process:
1. **University requests additional documents**
   - Admin (on behalf of university) selects "Request Corrections"
   - Specifies required documents with descriptions
   - Status changes to `university_requested_corrections`
   - NextActor changes to "Partner"

2. **Partner uploads corrections**
   - Similar process to Stage 1 corrections
   - Partner uploads requested documents
   - Status returns to `sent_to_university`
   - University reviews again

### Scenario C: University Suggests Program Change (`program_change_suggested`)

#### Program Change Process:
1. **University suggests different program**
   - Admin (on behalf of university) selects "Suggest Program Change"
   - Provides details of suggested program and reason
   - Status changes to `program_change_suggested`
   - NextActor changes to "Partner"

2. **Partner makes decision**
   - Partner sees program change suggestion with details
   - Partner can: Accept or Reject the suggested program
   
   **If Partner Accepts** (`program_change_accepted`):
   - Admin creates new application with suggested program
   - Process continues with new program details
   
   **If Partner Rejects** (`program_change_rejected`):
   - Partner can choose to continue with original program or terminate
   - If continue: returns to `sent_to_university`
   - If terminate: moves to `rejected_university`

### Scenario D: University Rejects (`rejected_university`)

#### University Rejection:
1. **University rejects application**
   - Admin selects "Reject Application"
   - Must provide detailed rejection reason
   - Status changes to `rejected_university`
   - Process ends

#### Partner Experience:
- Receives rejection notification with reason
- No further actions available
- Application process terminates

---

## Stage 3: Visa Processing

### Entry Point: `offer_letter_issued` (From Stage 2)

#### Admin Starts Visa Process:
1. **Admin initiates visa procedure**
   - Status starts as `offer_letter_issued`
   - Admin sets visa fee amount and payment method
   - Status changes to `waiting_visa_payment`
   - NextActor changes to "Partner"

### Visa Payment Process

#### Partner Payment Submission:
1. **Partner sees payment request**
   - Dashboard shows "Waiting for Payment"
   - Status explanation: "Offer letter uploaded. Please submit visa fee payment receipt."
   - Shows required payment amount and method
   - "Action Required" panel with "Upload Payment Receipt" button

2. **Partner uploads payment receipt**
   - Navigates to Documents tab or clicks action button
   - Uploads payment receipt (PDF, JPG, PNG accepted)
   - System validates file format
   - Status changes to `payment_submitted`

#### Admin Payment Review:
1. **Admin reviews payment receipt**
   - Receives notification of payment submission
   - Reviews uploaded receipt document
   - Makes decision: Approve or Reject

   **If Approved** (`payment_received`):
   - Status changes to `payment_received`
   - Admin prepares immigration submission
   
   **If Rejected** (`payment_rejected`):
   - Status changes to `payment_rejected`
   - Partner must resubmit correct payment receipt
   - Returns to `payment_submitted` when partner uploads new receipt

### Immigration Submission Process

#### Admin Submits to Immigration:
1. **Admin submits to immigration authorities**
   - From `payment_received`, admin clicks "Submit to Immigration"
   - Admin records tracking/reference number
   - Status changes to `submitted_to_immigration`
   - NextActor changes to "Immigration"

#### Immigration Review Process:

**Immigration Approves** (`visa_issued`):
1. **Visa is issued**
   - Admin (on behalf of immigration) uploads visa document and number
   - Status changes to `visa_issued`
   - NextActor changes to "Partner"
   - **Prepares to move to Stage 4**

2. **Partner confirms arrival date**
   - Partner sees "Visa Issued" status
   - Must confirm planned student arrival date
   - Enters date in YYYY-MM-DD format
   - **Application moves to Stage 4**

**Immigration Requests Documents** (`immigration_requested_documents`):
1. **Immigration needs more documents**
   - Admin requests additional documents on behalf of immigration
   - Partner uploads requested documents
   - Returns to `submitted_to_immigration`

**Immigration Rejects** (`visa_rejected`):
1. **Visa application rejected**
   - Admin provides rejection reason
   - Status changes to `visa_rejected`
   - Process ends
   - Partner receives notification with reason

---

## Stage 4: Student Arrival & Enrollment

### Entry Point: `waiting_arrival_date` (From Stage 3)

#### Partner Arrival Date Confirmation:
1. **Partner confirms arrival date**
   - Status shows "Waiting Partner to confirm arrival date"
   - Partner enters planned arrival date
   - Status changes to `arrival_date_confirmed`

### Student Arrival Process

#### Partner Reports Arrival:
1. **Partner confirms student has arrived**
   - Status shows "Arrival Date Confirmed"
   - Partner clicks "Confirm Student Arrived"
   - Status changes to `student_arrived`
   - NextActor changes to "Admin"

#### Admin Verifies Arrival:
1. **Admin verifies arrival information**
   - Reviews partner's arrival confirmation
   - May request supporting documents
   - Makes verification decision

   **If Verified** (`arrival_verified`):
   - Status changes to `arrival_verified`
   - NextActor changes to "Partner"
   - Partner must upload enrollment proof
   
   **If Rejected** (`arrival_verification_rejected`):
   - Status changes to `arrival_verification_rejected`
   - Partner must provide additional justification/documents
   - Returns to `student_arrived`

### Enrollment Confirmation Process

#### Partner Submits Enrollment Proof:
1. **Partner uploads enrollment confirmation**
   - Status shows "Student Arrival Verified"
   - Partner uploads enrollment proof documents
   - Status changes to `enrollment_confirmation_submitted`

#### Admin Reviews Enrollment:
1. **Admin approves enrollment**
   - Reviews enrollment proof documents
   - Approves enrollment (rejection requires reason)
   - Status changes to `enrollment_completed`
   - **Application moves to Stage 5**

---

## Stage 5: Partner Commission

### Entry Point: `commission_pending` (From Stage 4)

#### Commission Payment Process:
1. **Partner submits student payment proof**
   - Status shows "Commission Pending"
   - Partner uploads student payment receipt
   - Status changes to `payment_confirmation_submitted`

#### Admin Reviews Payment Confirmation:
1. **Admin reviews student payment proof**
   - Examines uploaded receipt
   - Makes decision: Approve or Reject

   **If Approved** (`commission_approved`):
   - Status changes to `commission_approved`
   - Admin prepares commission transfer
   
   **If Rejected** (`payment_confirmation_rejected`):
   - Partner must resubmit correct payment proof
   - Returns to `payment_confirmation_submitted`

### Commission Transfer Process

#### Admin Transfers Commission:
1. **Admin processes commission payment**
   - From `commission_approved`, admin initiates transfer
   - Admin uploads transfer proof/receipt
   - Status changes to `commission_released`
   - NextActor changes to "Partner"

#### Partner Confirms Receipt:
1. **Partner confirms commission received**
   - Reviews transfer proof
   - Has two options:

   **Confirm Receipt** (`commission_paid`):
   - Status changes to `commission_paid`
   - **Application process COMPLETE**
   - No further actions required
   
   **Dispute Transfer** (`commission_transfer_disputed`):
   - Status changes to `commission_transfer_disputed`
   - Admin must resolve dispute and resubmit transfer proof
   - Returns to `commission_released`

---

## Key User Interface Behavior at Each Stage

### What Admin Sees:
1. **Applications List Page**:
   - Applications grouped by stage
   - "Action Required" badge for applications needing admin attention
   - Priority indicators (High/Medium/Low)
   - Quick status filters

2. **Application Details Page**:
   - Large status hero section explaining current situation
   - "Action Required" panel when admin action needed
   - Timeline showing progress through stages
   - Document management interface
   - Status update modal with guided options

### What Partner Sees:
1. **Applications List Page**:
   - Clear status descriptions in partner-friendly language
   - "Action Required" section prominently displayed
   - Easy filtering by status

2. **Application Details Page**:
   - Status explanation written for non-technical users
   - Clear next steps when action required
   - Document upload interface with requirements
   - Progress timeline showing where application stands
   - Communication panel for admin contact

### Status Update Modal Behavior:
- **Admin Modal**: Shows all possible status transitions with descriptions
- **Partner Modal**: Shows only actions partner is authorized to take
- **Validation**: Real-time validation of required fields (reasons, documents, etc.)
- **Confirmation**: Success messages after status updates
- **Error Handling**: Clear error messages if validation fails

This workflow ensures that both admins and partners always know:
1. Where the application currently stands
2. What action (if any) is required from them
3. What happens next in the process
4. How to complete required actions efficiently