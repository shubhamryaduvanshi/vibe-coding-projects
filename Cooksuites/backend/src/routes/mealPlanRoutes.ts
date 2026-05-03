import { Router } from 'express';
import { mealPlanController } from '../controllers/MealPlanController';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();

// All meal plan routes require authentication
router.use(authenticate);

// List and Create
router.get('/', requirePermission('mealplan:read'), mealPlanController.listMealPlans);
router.post('/', requirePermission('mealplan:create'), mealPlanController.createMealPlan);

// Single Meal Plan Operations
router.get('/:id', requirePermission('mealplan:read'), mealPlanController.getMealPlan);
router.put('/:id', requirePermission('mealplan:create'), mealPlanController.updateMealPlan); // Note: using create perm for updates too
router.delete('/:id', requirePermission('mealplan:delete'), mealPlanController.deleteMealPlan);

// Entries
router.post('/:id/entries', requirePermission('mealplan:create'), mealPlanController.addEntry);
router.put('/:id/entries/bulk', requirePermission('mealplan:create'), mealPlanController.bulkUpdateEntries);
router.delete('/:id/entries/:entryId', requirePermission('mealplan:create'), mealPlanController.removeEntry);

// Shopping List
router.post('/:id/shopping-list', requirePermission('mealplan:read'), mealPlanController.generateShoppingList);

export default router;
