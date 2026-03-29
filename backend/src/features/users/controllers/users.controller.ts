import { Request, Response } from 'express';
import { prisma } from '../../../lib/prisma';
import { userService } from '../services/users.service';

export class UserController {
  /**
   * GET /users/managers — managers in the same company as the authenticated user
   */
  async getManagers(req: Request, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const current = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { companyId: true },
      });

      if (!current) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const managers = await userService.getManagersByCompany(current.companyId ?? null);
      res.json({ success: true, data: managers });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /users/team — employees + managers for the same company scope as the admin (excludes ADMIN)
   */
  async getTeam(req: Request, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const current = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { companyId: true },
      });

      if (!current) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const users = await userService.getTeamEmployeesAndManagers(current.companyId ?? null);
      console.log(`[DEBUG] getTeam: userId=${req.user.userId}, companyId=${current.companyId}, usersCount=${users.length}`);
      res.json({ success: true, data: users });
    } catch (error: any) {
      console.error(`[ERROR] getTeam: ${error.message}`, error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const admin = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { companyId: true, role: true },
      });

      if (!admin || admin.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Only admins can create users' });
      }

      if (!admin.companyId) {
        return res.status(400).json({
          success: false,
          error: 'Admin must belong to a company. Complete signup first.',
        });
      }

      const { email, name, password, role, managerId } = req.body as {
        email?: string;
        name?: string;
        password?: string;
        role?: string;
        managerId?: string | null;
      };

      if (!email || !name || !password || !role) {
        return res.status(400).json({
          success: false,
          error: 'email, name, password, and role are required',
        });
      }

      const validRoles = ['EMPLOYEE', 'MANAGER'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
        });
      }

      if (role === 'EMPLOYEE' && !managerId) {
        return res.status(400).json({
          success: false,
          error: 'managerId is required for EMPLOYEE role',
        });
      }

      if (role === 'MANAGER' && managerId) {
        return res.status(400).json({
          success: false,
          error: 'managerId must not be set for MANAGER role',
        });
      }

      if (role === 'EMPLOYEE' && managerId) {
        const managerOk = await userService.findManagerInCompany(managerId, admin.companyId);
        if (!managerOk) {
          return res.status(400).json({
            success: false,
            error: 'Invalid manager: must be a manager in your company',
          });
        }
      }

      const user = await userService.createUser({
        email,
        name,
        password,
        role: role as 'EMPLOYEE' | 'MANAGER',
        managerId: role === 'EMPLOYEE' ? managerId ?? null : null,
        companyId: admin.companyId,
      });

      res.status(201).json({ success: true, data: user });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        res.status(409).json({ success: false, error: 'Email is already registered' });
        return;
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();
      res.json({ success: true, data: users });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const user = await userService.getUserById(id);
      
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getUsersByRole(req: Request, res: Response) {
    try {
      const role = req.params.role as string;
      
      const validRoles = ['EMPLOYEE', 'MANAGER', 'ADMIN'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          success: false, 
          error: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
        });
      }
      
      const users = await userService.getUsersByRole(role);
      res.json({ success: true, data: users });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { email, name, role, managerId } = req.body;
      
      const user = await userService.updateUser(id, {
        email,
        name,
        role,
        managerId,
      });
      
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await userService.deleteUser(id);
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /** Diagnostic endpoint - shows all users in database */
  async debugAllUsers(req: Request, res: Response) {
    try {
      const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true, companyId: true, managerId: true },
        orderBy: [{ companyId: 'asc' }, { role: 'asc' }, { email: 'asc' }],
      });

      const companies = await prisma.company.findMany({
        select: { id: true, name: true },
      });

      // Group users by company
      const usersByCompany: { [key: string]: any[] } = {};
      allUsers.forEach(user => {
        const compKey = user.companyId || 'NO_COMPANY';
        if (!usersByCompany[compKey]) {
          usersByCompany[compKey] = [];
        }
        usersByCompany[compKey].push(user);
      });

      res.json({ 
        success: true, 
        data: {
          totalUsers: allUsers.length,
          totalCompanies: companies.length,
          companies,
          allUsers,
          usersByCompany,
          summary: {
            admins: allUsers.filter(u => u.role === 'ADMIN').length,
            managers: allUsers.filter(u => u.role === 'MANAGER').length,
            employees: allUsers.filter(u => u.role === 'EMPLOYEE').length,
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /** Diagnostic endpoint - shows all users grouped by role and company */
  async debugUsersByCompany(req: Request, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const current = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { companyId: true, email: true, role: true },
      });

      if (!current) {
        return res.status(401).json({ success: false, error: 'Current user not found' });
      }

      // Get all users in the same company
      const allUsers = await prisma.user.findMany({
        where: { companyId: current.companyId },
        select: { id: true, email: true, name: true, role: true, companyId: true, managerId: true },
        orderBy: [{ role: 'asc' }, { email: 'asc' }],
      });

      // Get team users (employees + managers only)
      const teamUsers = await prisma.user.findMany({
        where: { 
          role: { in: ['EMPLOYEE', 'MANAGER'] },
          companyId: current.companyId,
        },
        select: { id: true, email: true, name: true, role: true, managerId: true },
        orderBy: [{ name: 'asc' }, { email: 'asc' }],
      });

      res.json({ 
        success: true, 
        data: {
          currentUser: {
            userId: req.user.userId,
            email: current.email,
            role: current.role,
            companyId: current.companyId,
          },
          allUsersInCompany: allUsers,
          teamUsers: teamUsers,
          teamUserCount: teamUsers.length,
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const userController = new UserController();
