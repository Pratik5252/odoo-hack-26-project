import { Request, Response } from 'express';
import { userService } from '../services/users.service';

export class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const { email, name, password, role, managerId } = req.body;
      
      if (!email || !name || !password || !role) {
        return res.status(400).json({ 
          success: false, 
          error: 'email, name, password, and role are required' 
        });
      }
      
      const validRoles = ['EMPLOYEE', 'MANAGER'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          success: false, 
          error: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
        });
      }
      
      if (role === 'EMPLOYEE' && !managerId) {
        return res.status(400).json({ 
          success: false, 
          error: 'managerId is required for EMPLOYEE role' 
        });
      }
      
      const user = await userService.createUser({
        email,
        name,
        password,
        role,
        managerId: managerId || null,
      });
      
      res.status(201).json({ success: true, data: user });
    } catch (error: any) {
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
}

export const userController = new UserController();
