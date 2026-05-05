import { Router } from 'express';
import { cookbookController } from '../controllers/CookbookController';
import { authenticate } from '../middleware/auth';
import { cookbookShareController } from '../controllers/CookbookShareController';
import { upload } from '../middleware/upload';

const router = Router();

// Public route for shared cookbooks - must be BEFORE authenticate middleware
router.get('/shared/:token', cookbookShareController.getSharedCookbook);

// All cookbook routes require authentication
router.use(authenticate);

router.post('/', upload.single('image'), cookbookController.create);
router.get('/', cookbookController.list);
router.get('/:id', cookbookController.get);
router.patch('/:id', upload.single('image'), cookbookController.update);
router.delete('/:id', cookbookController.delete);

// Recipe association routes
router.post('/:id/recipes', cookbookController.addRecipe);
router.delete('/:id/recipes/:recipeId', cookbookController.removeRecipe);

// Sharing routes
router.post('/:id/shares', cookbookShareController.createShare);
router.get('/:id/shares', cookbookShareController.listShares);
router.delete('/:id/shares/:shareId', cookbookShareController.revokeShare);

export default router;
