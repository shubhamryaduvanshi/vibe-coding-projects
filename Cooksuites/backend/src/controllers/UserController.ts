import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const UpdateProfileSchema = z.object({
  email: z.string().email().optional(),
});

export class UserController {
  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user?.id },
        select: { id: true, email: true, createdAt: true }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' }
        });
      }

      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = UpdateProfileSchema.parse(req.body);
      
      // If email is being updated, check if it already exists
      if (validated.email) {
        const existing = await prisma.user.findUnique({ where: { email: validated.email } });
        if (existing && existing.id !== req.user?.id) {
          return res.status(409).json({
            success: false,
            error: { code: 'CONFLICT', message: 'Email already in use' }
          });
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.user?.id },
        data: {
          ...(validated.email && { email: validated.email })
        },
        select: { id: true, email: true, createdAt: true }
      });

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input data', details: error.message }
        });
      }
      next(error);
    }
  }
}

export const userController = new UserController();
