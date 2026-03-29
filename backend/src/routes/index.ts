import { Router } from 'express';
import helloRoutes from '../features/approvals/routes/hello.routes';

const router = Router();

router.use('/approvals', helloRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default router;
