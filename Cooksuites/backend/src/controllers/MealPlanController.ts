import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { mealPlanService, CreateMealPlanSchema, UpdateMealPlanSchema, AddMealPlanEntrySchema } from '../services/MealPlanService';

export class MealPlanController {
  async createMealPlan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = CreateMealPlanSchema.parse(req.body);
      const result = await mealPlanService.createMealPlan(req.user!.id, data);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getMealPlan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await mealPlanService.getMealPlan(req.params.id as string, req.user!.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async listMealPlans(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await mealPlanService.listMealPlans(req.user!.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async updateMealPlan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = UpdateMealPlanSchema.parse(req.body);
      const result = await mealPlanService.updateMealPlan(req.params.id as string, req.user!.id, data);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async deleteMealPlan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await mealPlanService.deleteMealPlan(req.params.id as string, req.user!.id);
      res.status(200).json({ success: true, message: 'Meal plan deleted' });
    } catch (error) {
      next(error);
    }
  }

  async addEntry(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = AddMealPlanEntrySchema.parse(req.body);
      const result = await mealPlanService.addEntry(req.params.id as string, req.user!.id, data);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async bulkUpdateEntries(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = z.array(AddMealPlanEntrySchema).parse(req.body);
      const result = await mealPlanService.bulkUpdateEntries(req.params.id as string, req.user!.id, data);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async removeEntry(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await mealPlanService.removeEntry(req.params.id as string, req.params.entryId as string, req.user!.id);
      res.status(200).json({ success: true, message: 'Entry removed' });
    } catch (error) {
      next(error);
    }
  }

  async generateShoppingList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await mealPlanService.generateShoppingList(req.params.id as string, req.user!.id);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const mealPlanController = new MealPlanController();
