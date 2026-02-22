// src/routes/users.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { isAdmin } from '../../middleware/isAdmin.js';

const prisma = new PrismaClient();
const router = express.Router();

// Rota PATCH /api/users/me (SEU CÓDIGO ORIGINAL - SEM ALTERAÇÕES)
router.patch('/me', authMiddleware, async (req: Request, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  const userId = req.user.id;
  const { nickname, bio, twitchUrl } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        nickname: nickname !== undefined ? nickname : undefined,
        bio: bio !== undefined ? bio : undefined,
        twitchUrl: twitchUrl !== undefined ? twitchUrl : undefined,
      },
      select: { 
        id: true, name: true, email: true, picture: true, isPremium: true, 
        isAdmin: true, nickname: true, bio: true, twitchUrl: true,
      }
    });

    res.json(updatedUser);
  } catch (error: any) {
    console.error(`Erro ao atualizar perfil do usuário ${userId}:`, error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar perfil.' });
  }
});

// Rota GET /api/users (SEU CÓDIGO ORIGINAL - SEM ALTERAÇÕES)
router.get('/', authMiddleware, isAdmin, async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, picture: true, isPremium: true, isAdmin: true, nickname: true, bio: true, twitchUrl: true }
    });
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
});


// --- ✅ NOVAS ROTAS ADICIONADAS PARA O ADMIN ---

// ROTA ADICIONADA: GET /api/users/:userId
// Objetivo: Buscar os dados de um utilizador específico (Apenas Admin)
router.get('/:userId', authMiddleware, isAdmin, async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, picture: true, isPremium: true, isAdmin: true, nickname: true, bio: true, twitchUrl: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }
    res.json(user);
  } catch (error) {
    console.error(`Erro ao buscar utilizador ${userId}:`, error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// ROTA ADICIONADA: PATCH /api/users/:userId
// Objetivo: Permite que um admin atualize o perfil de qualquer utilizador.
router.patch('/:userId', authMiddleware, isAdmin, async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { nickname, bio, twitchUrl, isPremium } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                nickname: nickname !== undefined ? nickname : undefined,
                bio: bio !== undefined ? bio : undefined,
                twitchUrl: twitchUrl !== undefined ? twitchUrl : undefined,
                isPremium: isPremium !== undefined ? isPremium : undefined,
            },
            select: { id: true, name: true, email: true, picture: true, isPremium: true, isAdmin: true, nickname: true, bio: true, twitchUrl: true }
        });
        res.json(updatedUser);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Utilizador não encontrado.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar perfil.' });
    }
});

export default router;
