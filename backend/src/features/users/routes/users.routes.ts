import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { userController } from '../controllers/users.controller';

const router = Router();

/** Diagnostic endpoint - shows all users grouped by role and company */
router.get('/debug/users', userController.debugAllUsers.bind(userController));

router.post('/', authMiddleware, userController.createUser.bind(userController));
router.get('/', userController.getAllUsers.bind(userController));
/** Static paths must be registered before /:id */
router.get('/managers', authMiddleware, userController.getManagers.bind(userController));
router.get('/team', authMiddleware, userController.getTeam.bind(userController));
/** Diagnostic endpoint - shows all users grouped by role and company */
router.get('/debug/users-by-company', authMiddleware, userController.debugUsersByCompany.bind(userController));
router.get('/role/:role', userController.getUsersByRole.bind(userController));
router.get('/:id', userController.getUserById.bind(userController));
router.put('/:id', userController.updateUser.bind(userController));
router.delete('/:id', userController.deleteUser.bind(userController));

export default router;
