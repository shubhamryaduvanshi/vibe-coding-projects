import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { cookbookShareService, CreateShareSchema } from '../services/CookbookShareService';

export class CookbookShareController {
  async createShare(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = CreateShareSchema.parse(req.body);
      const result = await cookbookShareService.createShare(req.params.id as string, req.user!.id, data);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async listShares(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await cookbookShareService.listShares(req.params.id as string, req.user!.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async revokeShare(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await cookbookShareService.revokeShare(req.params.id as string, req.params.shareId as string, req.user!.id);
      res.status(200).json({ success: true, message: 'Share link revoked' });
    } catch (error) {
      next(error);
    }
  }

  async getSharedCookbook(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // This is a public endpoint, uses token from URL params
      const result = await cookbookShareService.getShareByToken(req.params.token as string);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const cookbookShareController = new CookbookShareController();
