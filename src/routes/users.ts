// src/routes/users.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { isAdmin } from '../../middleware/isAdmin.js';

const prisma = new PrismaClient();
const router = express.Router();

// --- ROTA: PATCH /api/users/me (CORRIGIDA PARA BUILD E TELEMETRIA) ---
router.patch('/me', authMiddleware, async (req: Request, res: Response) => {
  // Usamos 'as any' para evitar o erro TS2339, já que o payload do seu JWT usa 'userId'
  const user = req.user as any;
  const userId = user?.userId || user?.id;

  if (!userId) {
    console.error("[AUTH ERROR] userId não encontrado no payload do token.");
    return res.status(401).json({ message: 'Usuário não autenticado ou token inválido.' });
  }

  const { nickname, bio, twitchUrl, language, theme } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        nickname: nickname !== undefined ? nickname : undefined,
        bio: bio !== undefined ? bio : undefined,
        twitchUrl: twitchUrl !== undefined ? twitchUrl : undefined,
        language: language !== undefined ? language : undefined,
        theme: theme !== undefined ? theme : undefined,
      },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        picture: true, 
        isPremium: true, 
        isAdmin: true, 
        nickname: true, 
        bio: true, 
        twitchUrl: true,
        language: true, 
        theme: true 
      }
    });

    res.json(updatedUser);
  } catch (error: any) {
    console.error(`Erro ao atualizar perfil do usuário ${userId}:`, error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Usuário não encontrado no banco de dados.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar perfil.' });
  }
});

// --- ROTA: GET /api/users (ADMIN: LISTAGEM COMPLETA) ---
router.get('/', authMiddleware, isAdmin, async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { 
        id: true, 
        name: true, 
        email: true, 
        picture: true, 
        isPremium: true, 
        isAdmin: true, 
        nickname: true, 
        bio: true, 
        twitchUrl: true,
        language: true,
        theme: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
});

// --- ROTA: GET /api/users/:userId (ADMIN: BUSCA ESPECÍFICA) ---
router.get('/:userId', authMiddleware, isAdmin, async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        picture: true, 
        isPremium: true, 
        isAdmin: true, 
        nickname: true, 
        bio: true, 
        twitchUrl: true,
        language: true,
        theme: true
      }
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

// --- ROTA: PATCH /api/users/:userId (ADMIN: ATUALIZAÇÃO DE QUALQUER PERFIL) ---
router.patch('/:userId', authMiddleware, isAdmin, async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { nickname, bio, twitchUrl, isPremium, language, theme } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                nickname: nickname !== undefined ? nickname : undefined,
                bio: bio !== undefined ? bio : undefined,
                twitchUrl: twitchUrl !== undefined ? twitchUrl : undefined,
                isPremium: isPremium !== undefined ? isPremium : undefined,
                language: language !== undefined ? language : undefined,
                theme: theme !== undefined ? theme : undefined,
            },
            select: { 
              id: true, 
              name: true, 
              email: true, 
              picture: true, 
              isPremium: true, 
              isAdmin: true, 
              nickname: true, 
              bio: true, 
              twitchUrl: true,
              language: true, 
              theme: true 
            }
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