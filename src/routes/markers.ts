// src/routes/markers.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../middleware/authMiddleware.js'; // ✅ CAMINHO CORRIGIDO com .js
import { isAdmin } from '../../middleware/isAdmin.js'; // ✅ CAMINHO CORRIGIDO com .js

const prisma = new PrismaClient();
const router = express.Router();

// Função auxiliar para converter chaves de snake_case para camelCase
const toCamelCase = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => toCamelCase(v));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
            acc[camelKey] = toCamelCase(obj[key]);
            return acc;
        }, {} as any);
    }
    return obj;
};

// Rota GET /api/markers
// Objetivo: Retorna APENAS marcadores APROVADOS. É PÚBLICA (não precisa de authMiddleware).
router.get('/', async (_req: Request, res: Response) => {
    try {
        const markers = await prisma.marker.findMany({
            where: { status: 'approved' },
            include: { author: { select: { id: true, name: true } } }, // Inclui apenas id e nome do autor
            orderBy: { createdAt: 'desc' }
        });
        // Converte os dados para camelCase antes de enviar
        res.json(markers.map(toCamelCase));
    } catch (error) {
        console.error('Erro ao buscar marcadores aprovados:', error);
        res.status(500).json({ error: 'Erro ao buscar marcadores aprovados' });
    }
});

// Rota POST /api/markers
// Objetivo: Cria um novo marcador com status 'pending'. Requer AUTENTICAÇÃO.
router.post('/', authMiddleware, async (req: Request, res: Response) => {
    // Verifica se o ID do usuário está disponível no request (garantido pelo authMiddleware)
    if (!req.user?.id) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }
    try {
        const { lat, lng, type, label, description } = req.body;
        const newMarker = await prisma.marker.create({
            data: {
                lat,
                lng,
                type,
                label,
                description, // Salva a descrição fornecida
                authorId: req.user.id, // O ID interno do usuário logado
                status: 'pending' // Novo marcador sempre começa como pendente
            },
            include: { author: { select: { id: true, name: true } } } // Retorna o autor do marcador
        });
        // Converte e retorna o novo marcador
        res.status(201).json(toCamelCase(newMarker));
    } catch (error) {
        console.error('Erro ao criar marcador:', error);
        res.status(500).json({ error: 'Erro ao criar marcador' });
    }
});

// Rota GET /api/markers/pending
// Objetivo: Retorna APENAS marcadores PENDENTES. Requer AUTENTICAÇÃO E ADMIN.
router.get('/pending', authMiddleware, isAdmin, async (_req: Request, res: Response) => {
    try {
        const markers = await prisma.marker.findMany({
            where: { status: 'pending' },
            include: { author: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        // Converte e retorna os marcadores pendentes
        res.json(markers.map(toCamelCase));
    } catch (error) {
        console.error('Erro ao buscar marcadores pendentes:', error);
        res.status(500).json({ error: 'Erro ao buscar marcadores pendentes' });
    }
});

// Rota PATCH /api/markers/:id
// Objetivo: Atualiza o status (aprovado/rejeitado) ou outros dados do marcador. Requer AUTENTICAÇÃO E ADMIN.
router.patch('/:id', authMiddleware, isAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    // Permite atualizar status, label e description
    const { status, label, description } = req.body;
    try {
        const updatedMarker = await prisma.marker.update({
            where: { id: Number(id) },
            data: { status, label, description }, // Atualiza os campos fornecidos
            include: { author: { select: { id: true, name: true } } } // Retorna o autor do marcador atualizado
        });
        // Converte e retorna o marcador atualizado
        res.json(toCamelCase(updatedMarker));
    } catch (error) {
        console.error(`Erro ao atualizar marcador ${id}:`, error);
        res.status(500).json({ error: 'Erro ao atualizar marcador' });
    }
});

// Rota DELETE /api/markers/:id
// Objetivo: Deleta um marcador específico. Requer AUTENTICAÇÃO E ADMIN.
router.delete('/:id', authMiddleware, isAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.marker.delete({ where: { id: Number(id) } });
        res.status(204).send(); // Resposta de sucesso sem conteúdo (No Content)
    } catch (error) {
        console.error(`Erro ao deletar marcador ${id}:`, error);
        res.status(500).json({ error: 'Erro ao deletar marcador' });
    }
});

// Rota DELETE /api/markers/clear
// Objetivo: Limpa TODOS os marcadores. Requer AUTENTICAÇÃO E ADMIN.
router.delete('/clear', authMiddleware, isAdmin, async (_req: Request, res: Response) => {
    try {
        await prisma.marker.deleteMany();
        res.status(204).send(); // Resposta de sucesso sem conteúdo (No Content)
    } catch (error) {
        console.error('Erro ao limpar todos os marcadores:', error);
        res.status(500).json({ error: 'Erro ao limpar todos os marcadores' });
    }
});

export default router;
