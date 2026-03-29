# Approvals Feature

## Purpose
Manages the complete approval workflow including submission, review, and tracking.

## Structure
- **controllers/**: Approval request handlers
- **services/**: Approval business logic and workflow management
- **routes/**: Approval endpoints

## Key Endpoints
- `GET /api/approvals` - List approvals
- `GET /api/approvals/:id` - Get approval details
- `POST /api/approvals` - Create approval request
- `PUT /api/approvals/:id` - Update approval status
- `GET /api/approvals/status/:status` - Filter by status

## Related Frontend
- `/frontend/src/features/approvals/pages/`
- `/frontend/src/features/approvals/components/ApprovalTable.tsx`
