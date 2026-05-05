import { Router } from 'express';
import { userController } from '../controllers/UserController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/me', authenticate, userController.getMe);
router.get('/profile', authenticate, userController.getMe);
router.put('/me', authenticate, userController.updateMe);
router.put('/profile', authenticate, userController.updateMe);

export default router;
