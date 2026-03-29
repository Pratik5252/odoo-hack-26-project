import { Router } from 'express';
import { managerController } from '../controllers/managers.controller';
import { authMiddleware } from '../../../middleware/authMiddleware';

const router = Router();

// Note: Manager creation now unified at POST /users with role="MANAGER"
router.get('/', managerController.getAllManagers.bind(managerController));
router.get('/:id', managerController.getManagerById.bind(managerController));
router.put('/:id', managerController.updateManager.bind(managerController));
router.delete('/:id', managerController.deleteManager.bind(managerController));
router.get('/:id/team', managerController.getTeam.bind(managerController));

/** Get team expenses for authenticated manager */
router.get('/team/expenses/all', authMiddleware, managerController.getTeamExpenses.bind(managerController));

export default router;
