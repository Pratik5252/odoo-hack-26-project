import { Request, Response } from 'express';
import { expenseService } from '../services/expenses.service';

export class ExpenseController {
  async getAllExpenses(req: Request, res: Response) {
    try {
      const expenses = await expenseService.getAllExpenses();
      res.json({ success: true, data: expenses });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getExpenseById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const expense = await expenseService.getExpenseById(id);
      
      if (!expense) {
        return res.status(404).json({ success: false, error: 'Expense not found' });
      }
      
      res.json({ success: true, data: expense });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getExpensesByUserId(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string;
      const expenses = await expenseService.getExpensesByUserId(userId);
      res.json({ success: true, data: expenses });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createExpense(req: Request, res: Response) {
    try {
      const { userId, amount, category, description, receiptUrl } = req.body;
      
      if (!userId || !amount || !category) {
        return res.status(400).json({ 
          success: false, 
          error: 'userId, amount, and category are required' 
        });
      }
      
      const expense = await expenseService.createExpense({
        userId,
        amount: parseFloat(amount),
        category,
        description: description || null,
        receiptUrl: receiptUrl || null,
      });
      
      res.status(201).json({ success: true, data: expense });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateExpense(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { amount, category, description, receiptUrl, status } = req.body;
      
      const validStatuses = ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ 
          success: false, 
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        });
      }
      
      const expense = await expenseService.updateExpense(id, {
        amount: amount ? parseFloat(amount) : undefined,
        category,
        description,
        receiptUrl,
        status: status as 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | undefined,
      });
      
      res.json({ success: true, data: expense });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteExpense(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await expenseService.deleteExpense(id);
      res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getExpensesByStatus(req: Request, res: Response) {
    try {
      const status = req.params.status as string;
      
      const validStatuses = ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          success: false, 
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        });
      }
      
      const expenses = await expenseService.getExpensesByStatus(status as 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED');
      res.json({ success: true, data: expenses });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const expenseController = new ExpenseController();
