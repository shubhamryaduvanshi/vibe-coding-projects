import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../middleware/error';

const prisma = new PrismaClient();

export const CreateShareSchema = z.object({
  role: z.enum(['viewer', 'editor']).default('viewer'),
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

interface ShareTokenPayload {
  shareId: string;
  cookbookId: string;
  role: string;
}

export class CookbookShareService {
  private get secret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');
    return secret;
  }

  async createShare(cookbookId: string, userId: string, data: z.infer<typeof CreateShareSchema>) {
    const cookbook = await prisma.cookbook.findUnique({ where: { id: cookbookId } });
    if (!cookbook) throw new NotFoundError('Cookbook not found');
    if (cookbook.userId !== userId) throw new ForbiddenError('Only the owner can share this cookbook');

    let expiresAt: Date | null = null;
    if (data.expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + data.expiresInDays);
    }

    // Create the DB record first to get the shareId
    // We store a temporary token, then update it with the signed JWT
    const tempShare = await prisma.cookbookShare.create({
      data: {
        cookbookId,
        role: data.role,
        expiresAt,
        shareToken: `temp_${Date.now()}_${Math.random()}`
      }
    });

    const payload: ShareTokenPayload = {
      shareId: tempShare.id,
      cookbookId,
      role: data.role,
    };

    const tokenOptions: jwt.SignOptions = {};
    if (data.expiresInDays) {
      tokenOptions.expiresIn = `${data.expiresInDays}d`;
    }

    const shareToken = jwt.sign(payload, this.secret, tokenOptions);

    // Update with real token
    const finalShare = await prisma.cookbookShare.update({
      where: { id: tempShare.id },
      data: { shareToken }
    });

    return finalShare;
  }

  async getShareByToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.secret) as ShareTokenPayload;

      const share = await prisma.cookbookShare.findUnique({
        where: { id: decoded.shareId }
      });

      if (!share) throw new NotFoundError('Share link not found or revoked');
      if (share.shareToken !== token) throw new UnauthorizedError('Invalid share token');

      if (share.expiresAt && share.expiresAt < new Date()) {
        throw new ForbiddenError('Share link has expired');
      }

      // Increment view count
      await prisma.cookbookShare.update({
        where: { id: share.id },
        data: { viewCount: { increment: 1 } }
      });

      // Return cookbook with recipes
      const cookbook = await prisma.cookbook.findUnique({
        where: { id: share.cookbookId },
        include: {
          recipes: {
            include: {
              recipe: {
                select: { id: true, title: true, difficulty: true, cookingTimeMinutes: true, images: true }
              }
            }
          },
          user: {
            select: { id: true, name: true, email: true } // Return owner info
          }
        }
      });

      if (!cookbook) throw new NotFoundError('Cookbook not found');

      return {
        cookbook,
        access: {
          role: share.role,
          expiresAt: share.expiresAt
        }
      };
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new ForbiddenError('Share link has expired');
      }
      if (err instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid share token');
      }
      throw err;
    }
  }

  async listShares(cookbookId: string, userId: string) {
    const cookbook = await prisma.cookbook.findUnique({ where: { id: cookbookId } });
    if (!cookbook) throw new NotFoundError('Cookbook not found');
    if (cookbook.userId !== userId) throw new ForbiddenError('Access denied');

    return prisma.cookbookShare.findMany({
      where: { cookbookId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async revokeShare(cookbookId: string, shareId: string, userId: string) {
    const cookbook = await prisma.cookbook.findUnique({ where: { id: cookbookId } });
    if (!cookbook) throw new NotFoundError('Cookbook not found');
    if (cookbook.userId !== userId) throw new ForbiddenError('Access denied');

    const share = await prisma.cookbookShare.findUnique({ where: { id: shareId } });
    if (!share || share.cookbookId !== cookbookId) throw new NotFoundError('Share link not found');

    await prisma.cookbookShare.delete({ where: { id: shareId } });
  }
}

export const cookbookShareService = new CookbookShareService();
