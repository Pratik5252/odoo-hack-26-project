# Auth Feature

## Purpose
Handles user authentication including login, signup, and session management.

## Structure
- **controllers/**: Auth request handlers (login, signup, logout)
- **services/**: Business logic for authentication and user validation
- **routes/**: Auth endpoints definition

## Key Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout

## Related Frontend
- `/frontend/src/features/auth/pages/LoginPage.tsx`
- `/frontend/src/features/auth/pages/SignupPage.tsx`
