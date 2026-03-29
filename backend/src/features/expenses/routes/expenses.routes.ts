import { Router } from 'express';
import { expenseController } from '../controllers/expenses.controller';

const router = Router();

router.get('/', expenseController.getAllExpenses.bind(expenseController));
router.get('/:id', expenseController.getExpenseById.bind(expenseController));
router.post('/', expenseController.createExpense.bind(expenseController));
router.put('/:id', expenseController.updateExpense.bind(expenseController));
router.delete('/:id', expenseController.deleteExpense.bind(expenseController));
router.get('/user/:userId', expenseController.getExpensesByUserId.bind(expenseController));
router.get('/status/:status', expenseController.getExpensesByStatus.bind(expenseController));

export default router;
