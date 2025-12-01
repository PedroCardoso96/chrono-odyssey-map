// src/routes/routes.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { isAdmin } from '../../middleware/isAdmin.js'; // Importa o middleware de admin

const prisma = new PrismaClient();
const router = express.Router();

// --- ROTA PARA CRIAR UMA NOVA ROTA DE FARM --- (Seu código original - sem alterações)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'Utilizador não autenticado.' });
  }

  const { name, description, markerIds } = req.body;
  const authorId = req.user.id;

  if (!name || !markerIds || !Array.isArray(markerIds) || markerIds.length < 2) {
    return res.status(400).json({ message: 'Nome da rota e pelo menos dois marcadores são obrigatórios.' });
  }

  try {
    const newRoute = await prisma.farmRoute.create({
      data: {
        name,
        description: description || null,
        markerIdsInOrder: markerIds.join(','),
        authorId,
      },
    });
    res.status(201).json(newRoute);
  } catch (error) {
    console.error('Erro ao criar rota de farm:', error);
    res.status(500).json({ message: 'Erro interno ao criar a rota.' });
  }
});

// --- ROTA PARA LISTAR TODAS AS ROTAS DE FARM --- (Seu código original - sem alterações)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const routes = await prisma.farmRoute.findMany({
      include: {
        author: {
          select: { name: true, nickname: true },
        },
        _count: {
          select: { likes: true, savedByUsers: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(routes);
  } catch (error) {
    console.error('Erro ao listar rotas de farm:', error);
    res.status(500).json({ message: 'Erro interno ao listar as rotas.' });
  }
});


// --- ✅ NOVAS ROTAS ADICIONADAS PARA O PERFIL ---

// ROTA PARA BUSCAR AS ROTAS CRIADAS PELO UTILIZADOR LOGADO
router.get('/my-routes', authMiddleware, async (req: Request, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'Utilizador não autenticado.' });
  }
  const userId = req.user.id;

  try {
    const myRoutes = await prisma.farmRoute.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(myRoutes);
  } catch (error) {
    console.error(`Erro ao buscar rotas para o utilizador ${userId}:`, error);
    res.status(500).json({ message: 'Erro interno ao buscar as rotas.' });
  }
});

// ROTA PARA APAGAR UMA ROTA
router.delete('/:routeId', authMiddleware, async (req: Request, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'Utilizador não autenticado.' });
  }

  const userId = req.user.id;
  const { routeId } = req.params;

  try {
    const route = await prisma.farmRoute.findUnique({
      where: { id: routeId },
    });

    if (!route) {
      return res.status(404).json({ message: 'Rota não encontrada.' });
    }

    // Verifica se o utilizador é o autor da rota OU se é um admin
    if (route.authorId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para apagar esta rota.' });
    }

    // Apaga primeiro os likes e saves associados para evitar erros de constraint
    await prisma.routeLike.deleteMany({ where: { routeId: routeId } });
    await prisma.savedRoute.deleteMany({ where: { routeId: routeId } });

    // Agora apaga a rota
    await prisma.farmRoute.delete({
      where: { id: routeId },
    });

    res.status(200).json({ message: 'Rota apagada com sucesso.' });
  } catch (error) {
    console.error(`Erro ao apagar a rota ${routeId}:`, error);
    res.status(500).json({ message: 'Erro interno ao apagar a rota.' });
  }
});

export default router;
