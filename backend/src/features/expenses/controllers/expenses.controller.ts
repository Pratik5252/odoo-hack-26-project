import { Request, Response } from "express";
import { expenseService } from "../services/expenses.service";

export class ExpenseController {
  async getAllExpenses(req: Request, res: Response) {
    try {
      // GUARD: Authenticated users MUST use /me endpoint
      if (req.user?.userId) {
        return res.status(403).json({
          success: false,
          error:
            "Authenticated users must use /expenses/me to get their expenses",
        });
      }

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
        return res
          .status(404)
          .json({ success: false, error: "Expense not found" });
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
      // Get userId from auth token (from middleware)
      const authUserId = req.user?.userId;
      const bodyUserId = req.body.userId;
      const userId = authUserId || bodyUserId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "userId is required (via auth token or body)",
        });
      }

      const { amount, category, description, receiptUrl } = req.body;
      if (!amount || !category) {
        return res.status(400).json({
          success: false,
          error: "amount and category are required",
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

      const validStatuses = ["DRAFT", "PENDING", "APPROVED", "REJECTED"];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }

      const expense = await expenseService.updateExpense(id, {
        amount: amount ? parseFloat(amount) : undefined,
        category,
        description,
        receiptUrl,
        status: status as
          | "DRAFT"
          | "PENDING"
          | "APPROVED"
          | "REJECTED"
          | undefined,
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
      res.json({ success: true, message: "Expense deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getExpensesByStatus(req: Request, res: Response) {
    try {
      const status = req.params.status as string;

      const validStatuses = ["DRAFT", "PENDING", "APPROVED", "REJECTED"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }

      const expenses = await expenseService.getExpensesByStatus(
        status as "DRAFT" | "PENDING" | "APPROVED" | "REJECTED",
      );
      res.json({ success: true, data: expenses });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getMyExpenses(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      console.log(`\n${"=".repeat(60)}`);
      console.log(`[EXPENSES /me] GET /expenses/me called`);
      console.log(`  - Auth Present: ${req.user ? "YES" : "NO"}`);
      console.log(`  - userId: ${userId || "NONE"}`);
      console.log(`${"=".repeat(60)}\n`);

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, error: "Not authenticated" });
      }

      const expenses = await expenseService.getExpensesByUserId(userId);
      console.log(`✅ Found ${expenses.length} expenses for user ${userId}\n`);
      res.json({ success: true, data: expenses });
    } catch (error: any) {
      console.error(`❌ Error in /me:`, error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async submitExpense(req: Request, res: Response) {
    try {
      const expenseId = req.params.id as string;
      const userId = req.user?.userId;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, error: "Not authenticated" });
      }

      // Get the expense to verify it belongs to the user and is in DRAFT status
      const expense = await expenseService.getExpenseById(expenseId);
      if (!expense) {
        return res
          .status(404)
          .json({ success: false, error: "Expense not found" });
      }

      if (expense.userId !== userId) {
        return res
          .status(403)
          .json({
            success: false,
            error: "You can only submit your own expenses",
          });
      }

      if (expense.status !== "DRAFT") {
        return res
          .status(400)
          .json({
            success: false,
            error: `Cannot submit expense that is not in DRAFT status. Current status: ${expense.status}`,
          });
      }

      // Update status to PENDING
      const updatedExpense = await expenseService.updateExpense(expenseId, {
        status: "PENDING",
      });

      res.json({
        success: true,
        data: updatedExpense,
        message: "Expense submitted for approval",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  async getExpensesByManagerId(req: Request, res: Response) {
    try {
      const managerId = (req.user as any)?.userId;

      if (!managerId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const expenses = await expenseService.getExpensesByManagerId(managerId);
      res.json({ success: true, data: expenses });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const expenseController = new ExpenseController();
