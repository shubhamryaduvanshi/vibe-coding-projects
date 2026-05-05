import { Router } from 'express';
import { mealPlanController } from '../controllers/MealPlanController';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();

// All meal plan routes require authentication
router.use(authenticate);

// List and Create
router.get('/', requirePermission('meal-plan:read'), mealPlanController.listMealPlans);
router.post('/', requirePermission('meal-plan:create'), mealPlanController.createMealPlan);

// Single Meal Plan Operations
router.get('/:id', requirePermission('meal-plan:read'), mealPlanController.getMealPlan);
router.put('/:id', requirePermission('meal-plan:create'), mealPlanController.updateMealPlan); // Note: using create perm for updates too
router.delete('/:id', requirePermission('meal-plan:delete'), mealPlanController.deleteMealPlan);

// Entries
router.post('/:id/entries', requirePermission('meal-plan:create'), mealPlanController.addEntry);
router.put('/:id/entries/bulk', requirePermission('meal-plan:create'), mealPlanController.bulkUpdateEntries);
router.delete('/:id/entries/:entryId', requirePermission('meal-plan:create'), mealPlanController.removeEntry);

// Shopping List
router.post('/:id/shopping-list', requirePermission('meal-plan:read'), mealPlanController.generateShoppingList);

export default router;
