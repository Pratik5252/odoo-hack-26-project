# Expense Management App

A full-stack expense management and approval system built for the Odoo Hackathon. This application enables organizations to manage expenses, define approval workflows, and automate the approval process with role-based access control.

## 🎯 Overview

This is a **web-based expense management platform** that allows:
- **Employees** to submit and track expenses
- **Managers** to review and approve/reject expenses for their team
- **Admins** to configure approval workflows and manage users
- **Multi-company support** with independent user hierarchies

The system implements complex approval workflows with support for sequential/parallel approvals, required approvers, and approval thresholds.

## 🏗️ Architecture

![Expense Management App Architecture](docs/architecture.png)

**System Architecture Layers:**

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and **pnpm** 10+
- **PostgreSQL** database
- **.env** files with database connection and JWT secrets

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd odoo-hack-26-project
   ```

2. **Setup Backend**
   ```bash
   cd backend
   pnpm install
   cp .env.example .env
   # Edit .env with your DATABASE_URL and JWT secrets
   pnpm run migrate          # Apply database migrations
   pnpm run seed:manjeet     # Seed test data
   pnpm run dev              # Start development server
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   pnpm install
   pnpm run dev              # Start Vite dev server
   ```

4. **Access the app**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Prisma Studio: `pnpm run prisma:studio` (in backend)

### Default Test Credentials

After running `seed:manjeet`, you can login with:
- **Admin (Manjeet)**: `singhmanjeet5976@gmail.com` / `password123`
- **Manager**: `emp1@example.com` / `password123`
- **Employee 1**: `john5432@example.com` / `password123`
- **Employee 2**: `pratik@gmail.com` / `password123`

## 📋 Features

### Authentication & Authorization
- User signup with company creation
- JWT-based authentication
- Role-based access control (ADMIN, MANAGER, EMPLOYEE)
- Token refresh mechanism

### User Management
- Multi-company support with company isolation
- Admin dashboard for user CRUD operations
- Manager-Employee hierarchies
- Password management and email notifications

### Expense Management
- Create, edit, and submit expenses
- Track expense status (Draft → Pending → Approved/Rejected)
- Receipt URL support
- Category and amount tracking

### Approval Workflows
- Define custom approval rules per user
- Sequential vs parallel approvals
- Required/optional approvers
- Approval threshold (percentage-based)
- Audit trail and approval comments

### Admin Features
- User management interface
- Approval rule configuration
- Company and team oversight
- Password reset functionality

### Manager Features
- Team expense monitoring
- Quick approval/rejection interface
- Team member overview

## 📁 Project Structure

```
odoo-hack-26-project/
├── backend/
│   ├── src/
│   │   ├── auth/                    # Authentication logic
│   │   │   ├── controllers/
│   │   │   └── services/
│   │   ├── features/
│   │   │   ├── approvals/          # Approval workflows
│   │   │   ├── employees/          # Employee endpoints
│   │   │   ├── expenses/           # Expense management
│   │   │   ├── managers/           # Manager endpoints
│   │   │   └── users/              # User management
│   │   ├── middleware/              # Express middleware
│   │   ├── utils/                   # Helpers (password, tokens, validation)
│   │   ├── lib/                     # Libraries (prisma, mail, password)
│   │   ├── types/                   # TypeScript types
│   │   ├── app.ts                   # Express app setup
│   │   └── index.ts                 # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   └── migrations/              # Database migrations
│   ├── generated/
│   │   └── prisma/                  # Generated Prisma client
│   ├── package.json
│   └── .env                         # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/               # Auth pages & context
│   │   │   ├── employees/          # Employee pages & components
│   │   │   ├── expenses/           # Expense form & dashboard
│   │   │   ├── manager/            # Manager dashboard
│   │   │   └── admin/              # Admin dashboard
│   │   ├── components/
│   │   │   ├── auth/               # Auth UI components
│   │   │   ├── layout/             # Layout components
│   │   │   └── ui/                 # Reusable UI components
│   │   ├── routes/
│   │   │   └── AppRoutes.tsx       # Route definitions
│   │   ├── lib/
│   │   │   ├── apiBase.ts          # API configuration
│   │   │   └── utils.ts            # Utilities
│   │   ├── App.tsx                 # Main component
│   │   └── main.tsx                # Frontend entry point
│   ├── public/                      # Static assets
│   ├── package.json
│   └── vite.config.ts
│
└── README.md                        # This file
```

## 🔑 Key Technologies

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM and database migrations
- **PostgreSQL** - Database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Zod** - Schema validation
- **Nodemailer** - Email notifications
- **CORS** - Cross-origin requests

### Frontend
- **React** 19 - UI framework
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## 🔌 API Endpoints

### Authentication
- `POST /auth/signup` - Register new admin + company
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (client-side token removal)

### Users (Admin Management)
- `GET /users/team` - Get team members (employees + managers)
- `GET /users/managers` - Get managers in company
- `POST /users` - Create new user (EMPLOYEE/MANAGER)
- `POST /api/admin/users/send-password` - Send password reset email

### Expenses
- `GET /expenses` - List user's expenses
- `POST /expenses` - Create expense
- `PUT /expenses/:id` - Update expense
- `GET /expenses/:id` - Get expense details

### Approvals
- `GET /approvals` - List approvals to process
- `POST /approvals/:id/approve` - Approve expense
- `POST /approvals/:id/reject` - Reject expense
- `GET /approvals/status/:status` - Filter by status

### Debug Endpoints (Development)
- `GET /users/debug/users` - All users and companies
- `GET /users/debug/users-by-company` - Users in your company

## 🗄️ Database Schema

### User Model
- `id` - UUID
- `email` - Unique email
- `name` - Full name
- `password` - Hashed password (optional)
- `role` - ADMIN | MANAGER | EMPLOYEE
- `companyId` - Company reference
- `managerId` - Manager reference (for EMPLOYEE role)

### Company Model
- `id` - UUID
- `name` - Company name
- `country` - Country
- `baseCurrency` - Default currency
- `currencySymbol` - Symbol (₹, $, €, etc.)

### Expense Model
- `id` - UUID
- `userId` - Submitted by
- `amount` - Expense amount
- `category` - Category name
- `description` - Details
- `receiptUrl` - Receipt attachment URL
- `status` - DRAFT | PENDING | APPROVED | REJECTED
- `approvals` - Related ExpenseApproval records

### ExpenseApproval Model
- `id` - UUID
- `expenseId` - Expense reference
- `approverId` - Approver reference
- `status` - PENDING | APPROVED | REJECTED
- `comment` - Approval comment
- `approvedAt` - Timestamp of approval

### Workflow Model
- `id` - UUID
- `userId` - User this workflow applies to
- `name` - Rule name
- `isManagerApproved` - Is manager approval required
- `isApprovalSequence` - Sequential vs parallel
- `approvers` - Array of Approver records

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcryptjs with salt rounds
- **Company Isolation** - Users only see their company data
- **Role-Based Access** - Controllers check user role
- **CORS Protection** - Configurable allowed origins
- **Email Verification** - Optional, extensible for future use

## 🧪 Testing Data

Use the seed script to populate test data:

```bash
cd backend
pnpm run seed:manjeet
```

This creates:
- 1 Admin (Manjeet Singh)
- 1 Manager (John Employee)
- 2 Employees (John Doe, Pratik Kumar)
- All in the same company with proper hierarchy

## 📊 Development Workflow

1. **Start backend server**
   ```bash
   cd backend
   pnpm run dev        # Starts on :3000
   ```

2. **Start frontend dev server**
   ```bash
   cd frontend
   pnpm run dev        # Starts on :5173
   ```

3. **View/edit database**
   ```bash
   cd backend
   pnpm run prisma:studio  # Opens at :5555
   ```

4. **Make database schema changes**
   ```bash
   # Edit backend/prisma/schema.prisma
   pnpm run migrate    # Auto-creates migration
   ```

## 🛠️ Available Scripts

### Backend
```bash
pnpm run dev              # Start dev server with hot reload
pnpm run build            # Build TypeScript to dist/
pnpm run start            # Start production server
pnpm run migrate          # Apply pending migrations
pnpm run seed:manjeet     # Seed test data
pnpm run prisma:studio    # Open Prisma Studio visual editor
```

### Frontend
```bash
pnpm run dev              # Start Vite dev server
pnpm run build            # Build optimized production bundle
pnpm run lint             # Run ESLint
pnpm run preview          # Preview production build
```

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgres://user:pass@localhost:5432/db
JWT_ACCESS_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
PORT=3000
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## 📄 License

ISC License - See LICENSE file for details

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Built for Odoo Hackathon 26 - Virtual Round**
