import { Request, Response } from 'express';
import { employeeService } from '../services/employees.service';

export class EmployeeController {
  async getAllEmployees(req: Request, res: Response) {
    try {
      const employees = await employeeService.getAllEmployees();
      res.json({ success: true, data: employees });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getEmployeeById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const employee = await employeeService.getEmployeeById(id);
      
      if (!employee) {
        return res.status(404).json({ success: false, error: 'Employee not found' });
      }
      
      res.json({ success: true, data: employee });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createEmployee(req: Request, res: Response) {
    try {
      const { email, name, password, department, role } = req.body;
      
      if (!email || !name || !password) {
        return res.status(400).json({ success: false, error: 'Email, name, and password are required' });
      }
      
      const employee = await employeeService.createEmployee({
        email,
        name,
        password,
        department: department || null,
        role: role || 'employee',
      });
      
      res.status(201).json({ success: true, data: employee });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateEmployee(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { email, name, department, role } = req.body;
      
      const employee = await employeeService.updateEmployee(id, {
        email,
        name,
        department,
        role,
      });
      
      res.json({ success: true, data: employee });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteEmployee(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await employeeService.deleteEmployee(id);
      res.json({ success: true, message: 'Employee deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const employeeController = new EmployeeController();
