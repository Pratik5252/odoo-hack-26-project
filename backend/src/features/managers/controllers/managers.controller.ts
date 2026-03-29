import { Request, Response } from 'express';
import { managerService } from '../services/managers.service';

export class ManagerController {
  async getAllManagers(req: Request, res: Response) {
    try {
      const managers = await managerService.getAllManagers();
      res.json({ success: true, data: managers });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getManagerById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const manager = await managerService.getManagerById(id);
      
      if (!manager) {
        return res.status(404).json({ success: false, error: 'Manager not found' });
      }
      
      res.json({ success: true, data: manager });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createManager(req: Request, res: Response) {
    try {
      const { email, name, password, department } = req.body;
      
      if (!email || !name || !password) {
        return res.status(400).json({ success: false, error: 'Email, name, and password are required' });
      }
      
      const manager = await managerService.createManager({
        email,
        name,
        password,
        department: department || null,
      });
      
      res.status(201).json({ success: true, data: manager });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateManager(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { email, name, department } = req.body;
      
      const manager = await managerService.updateManager(id, {
        email,
        name,
        department,
      });
      
      res.json({ success: true, data: manager });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteManager(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await managerService.deleteManager(id);
      res.json({ success: true, message: 'Manager deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getTeam(req: Request, res: Response) {
    try {
      const managerId = req.params.id as string;
      const team = await managerService.getTeam(managerId);
      res.json({ success: true, data: team });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getTeamExpenses(req: Request, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      // Get expenses for the manager's team
      const expenses = await managerService.getTeamExpenses(req.user.userId);
      res.json({ success: true, data: expenses });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const managerController = new ManagerController();
