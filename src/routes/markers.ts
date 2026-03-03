// src/routes/markers.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { isAdmin } from '../../middleware/isAdmin.js';

const prisma = new PrismaClient();
const router = express.Router();

// FUNÇÃO CORRIGIDA: Transforma apenas as chaves (keys), preservando os valores (values)
const toCamelCase = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => toCamelCase(v));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            // Converte a chave (ex: author_id -> authorId)
            const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
            
            const value = obj[key];
            // TRAVA DE SEGURANÇA: Só aplica recursão se for objeto/array. 
            // Se for String (o conteúdo), mantém exatamente como está no DB.
            acc[camelKey] = (value !== null && typeof value === 'object') 
                ? toCamelCase(value) 
                : value;
                
            return acc;
        }, {} as any);
    }
    return obj;
};

const authorSelect = {
    select: {
        id: true,
        name: true,
        nickname: true,
        picture: true,
        isAdmin: true
    }
};

router.get('/', async (_req: Request, res: Response) => {
    try {
        const markers = await prisma.marker.findMany({
            where: { status: 'approved' },
            include: { author: authorSelect },
            orderBy: { createdAt: 'desc' }
        });
        res.json(markers.map(toCamelCase));
    } catch (error) {
        console.error('Erro ao buscar marcadores aprovados:', error);
        res.status(500).json({ error: 'Erro ao buscar marcadores aprovados' });
    }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
    if (!req.user?.id) return res.status(401).json({ error: 'Usuário não autenticado.' });
    try {
        const { lat, lng, type, label, description } = req.body;
        const newMarker = await prisma.marker.create({
            data: {
                lat, lng, type, label, description,
                authorId: req.user.id,
                status: 'pending'
            },
            include: { author: authorSelect }
        });
        res.status(201).json(toCamelCase(newMarker));
    } catch (error) {
        console.error('Erro ao criar marcador:', error);
        res.status(500).json({ error: 'Erro ao criar marcador' });
    }
});

router.get('/pending', authMiddleware, isAdmin, async (_req: Request, res: Response) => {
    try {
        const markers = await prisma.marker.findMany({
            where: { status: 'pending' },
            include: { author: authorSelect },
            orderBy: { createdAt: 'desc' }
        });
        res.json(markers.map(toCamelCase));
    } catch (error) {
        console.error('Erro ao buscar marcadores pendentes:', error);
        res.status(500).json({ error: 'Erro ao buscar marcadores pendentes' });
    }
});

router.patch('/:id', authMiddleware, isAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, label, description } = req.body;
    try {
        const updatedMarker = await prisma.marker.update({
            where: { id: Number(id) },
            data: { status, label, description },
            include: { author: authorSelect }
        });
        res.json(toCamelCase(updatedMarker));
    } catch (error) {
        console.error(`Erro ao atualizar marcador ${id}:`, error);
        res.status(500).json({ error: 'Erro ao atualizar marcador' });
    }
});

router.delete('/:id', authMiddleware, isAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.marker.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        console.error(`Erro ao deletar marcador ${id}:`, error);
        res.status(500).json({ error: 'Erro ao deletar marcador' });
    }
});

export default router;