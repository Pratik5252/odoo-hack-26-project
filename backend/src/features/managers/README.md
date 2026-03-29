# Managers Feature

## Purpose
Handles manager-specific operations like viewing reports, managing teams, and analytics.

## Structure
- **controllers/**: Manager request handlers
- **services/**: Manager business logic
- **routes/**: Manager endpoints

## Key Endpoints
- `GET /api/managers/team` - Get manager's team
- `GET /api/managers/reports` - Get team reports
- `GET /api/managers/analytics` - Get analytics

## Related Frontend
- `/frontend/src/features/manager/pages/ManagerDashboard.tsx`
- `/frontend/src/features/manager/components/`
