import { Router } from 'express';
import { employeeController } from '../controllers/employees.controller';

const router = Router();

router.get('/', employeeController.getAllEmployees.bind(employeeController));
router.get('/:id', employeeController.getEmployeeById.bind(employeeController));
router.post('/', employeeController.createEmployee.bind(employeeController));
router.put('/:id', employeeController.updateEmployee.bind(employeeController));
router.delete('/:id', employeeController.deleteEmployee.bind(employeeController));

export default router;
