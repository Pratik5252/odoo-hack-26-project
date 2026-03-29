import { Router } from 'express';
import { managerController } from '../controllers/managers.controller';

const router = Router();

router.get('/', managerController.getAllManagers.bind(managerController));
router.get('/:id', managerController.getManagerById.bind(managerController));
router.post('/', managerController.createManager.bind(managerController));
router.put('/:id', managerController.updateManager.bind(managerController));
router.delete('/:id', managerController.deleteManager.bind(managerController));
router.get('/:id/team', managerController.getTeam.bind(managerController));

export default router;
