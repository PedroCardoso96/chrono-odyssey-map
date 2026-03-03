// src/server.ts
import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs'; 
import https from 'https'; 
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';

// Imports das suas rotas e middlewares
import authRoutes from './routes/auth.js';
import markerRoutes from './routes/markers.js';
import stripeRoutes from './routes/stripe.js';
import usersRoutes from './routes/users.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isCompiled = __dirname.includes(path.join('dist', 'src'));
const projectRoot = isCompiled 
    ? path.resolve(__dirname, '..', '..') 
    : path.resolve(__dirname, '..');

const distBase = path.join(projectRoot, 'dist');

const app = express();
const PORT = process.env.PORT || 3001;

const ENABLE_TIMERS_FOR_ALL_TEMPORARILY = true;

const corsOptions: cors.CorsOptions = {
    origin: ['https://www.chronoodyssey.com.br', 'https://chronoodyssey.com.br', 'http://localhost:5173', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// ROTA DO WEBHOOK DO STRIPE
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    if (userId) {
      try {
        await prisma.user.update({ where: { id: userId }, data: { isPremium: true } });
      } catch (dbError) {
        console.error(`Erro ao atualizar usuário:`, dbError);
      }
    }
  }
  res.status(200).json({ received: true });
});

app.use(express.json());

// Middlewares de segurança
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
        return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', 'upgrade-insecure-requests');
    next();
});

// --- ROTAS DA API ---
app.use('/api/auth', authRoutes);
app.use('/api/markers', markerRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/users', usersRoutes);

// --- SISTEMA DE NOTÍCIAS (CRUD COMPLETO) ---

// 1. GET: Listar notícias (Pública)
app.get('/newsapi/noticias', async (req, res) => {
    try {
        const noticias = await prisma.post.findMany({
            orderBy: { publishedAt: 'desc' },
            include: { author: { select: { name: true, nickname: true } } }
        });
        res.json(noticias);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar notícias" });
    }
});

// 2. POST: Criar notícia (Admin)
app.post('/newsapi/noticias', authMiddleware, async (req, res) => {
    if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Acesso negado.' });
    const { title, contentHtml, sourceUrl } = req.body;
    try {
        const slug = title.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
        const novaNoticia = await prisma.post.create({
            data: { title, slug, contentHtml, sourceUrl, authorId: req.user.id },
        });
        res.status(201).json(novaNoticia);
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar notícia." });
    }
});

// 3. PATCH: Editar notícia (Admin)
app.patch('/newsapi/noticias/:id', authMiddleware, async (req, res) => {
    if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Acesso negado.' });
    const { title, contentHtml, sourceUrl } = req.body;
    try {
        const slug = title ? title.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '') : undefined;
        const noticiaAtualizada = await prisma.post.update({
            where: { id: req.params.id },
            data: { title, contentHtml, sourceUrl, slug }
        });
        res.json(noticiaAtualizada);
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar notícia." });
    }
});

// 4. DELETE: Remover notícia (Admin)
app.delete('/newsapi/noticias/:id', authMiddleware, async (req, res) => {
    if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Acesso negado.' });
    try {
        await prisma.post.delete({ where: { id: req.params.id } });
        res.json({ message: "Notícia removida." });
    } catch (error) {
        res.status(500).json({ error: "Erro ao remover notícia." });
    }
});

// Timers Premium
app.get('/api/timers', authMiddleware, async (req, res) => {
    if (!req.user?.id) return res.status(401).json({ message: 'Não autenticado.' });
    try {
        let whereClause: any = { isActive: true };
        if (!ENABLE_TIMERS_FOR_ALL_TEMPORARILY && !req.user.isPremium) whereClause.isPremium = false;
        const timers = await prisma.respawnTimer.findMany({ where: whereClause, orderBy: { nextRespawnAt: 'asc' } });
        res.json(timers);
    } catch (error) {
        res.status(500).json({ message: 'Erro nos timers.' });
    }
});

app.use(express.static(path.join(distBase, 'client')));
app.get('*', (req, res) => { res.sendFile(path.join(distBase, 'client', 'index.html')); });

process.on('beforeExit', async () => { await prisma.$disconnect(); });
app.listen(PORT, () => { console.log(`Servidor rodando na porta ${PORT}`); });