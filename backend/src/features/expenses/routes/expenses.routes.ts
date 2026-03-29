import { Router, type Request, type Response } from 'express';
import { expenseController } from '../controllers/expenses.controller';
import { authMiddleware } from '../../../middleware/authMiddleware';

const router = Router();

// ============================================
// DEBUG ROUTE - should ALWAYS work
// ============================================
router.get('/debug/health', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Expenses router is working!' });
});

// ============================================
// CRITICAL: Routes MUST be in this exact order!
// Specific routes BEFORE param routes (:id)
// ============================================

// 1. Get current user's expenses (protected)
router.get('/me', authMiddleware, expenseController.getMyExpenses.bind(expenseController));

// 2. Routes with specific path segments
router.get('/user/:userId', expenseController.getExpensesByUserId.bind(expenseController));
router.get('/status/:status', expenseController.getExpensesByStatus.bind(expenseController));
router.get('/', expenseController.getAllExpenses.bind(expenseController));
router.get('/manager/team-expenses', authMiddleware, expenseController.getExpensesByManagerId.bind(expenseController));
router.get('/user/:userId', expenseController.getExpensesByUserId.bind(expenseController));
router.get('/status/:status', expenseController.getExpensesByStatus.bind(expenseController));
router.get('/:id', expenseController.getExpenseById.bind(expenseController));
router.post('/', expenseController.createExpense.bind(expenseController));
router.put('/:id', expenseController.updateExpense.bind(expenseController));

// 3. Generic routes
router.get('/', expenseController.getAllExpenses.bind(expenseController));
router.post('/', authMiddleware, expenseController.createExpense.bind(expenseController));

// 4. MUST BE LAST! Param-based routes
router.get('/:id', expenseController.getExpenseById.bind(expenseController));
router.put('/:id/:action', authMiddleware, (req: Request, res: Response) => {
  if (req.params.action === 'submit') {
    return expenseController.submitExpense(req, res);
  }
  return expenseController.updateExpense(req, res);
});
router.put('/:id', authMiddleware, expenseController.updateExpense.bind(expenseController));
router.delete('/:id', authMiddleware, expenseController.deleteExpense.bind(expenseController));

export default router;
