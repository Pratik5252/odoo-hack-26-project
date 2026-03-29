# Employees Feature

## Purpose
Manages employee profiles, data, and employee-side operations like submitting requests.

## Structure
- **controllers/**: Employee request handlers
- **services/**: Employee business logic (CRUD operations)
- **routes/**: Employee endpoints

## Key Endpoints
- `GET /api/employees` - List all employees
- `GET /api/employees/:id` - Get employee details
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

## Related Frontend
- `/frontend/src/features/employees/pages/`
- `/frontend/src/features/employees/components/`
