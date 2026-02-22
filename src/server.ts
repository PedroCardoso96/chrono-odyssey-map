// src/server.ts
import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs'; // Manter se necessário para HTTPS local
import https from 'https'; // Manter se necessário para HTTPS local
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

// Inicializa o cliente do Stripe com sua chave secreta e versão da API
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2025-06-30.basil',
  typescript: true,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Ajuste para encontrar a raiz do projeto, que contém 'src' e 'middleware'
const projectRoot = path.resolve(__dirname, '..'); // '..' de 'src' leva à raiz do projeto

// ✅ MUDANÇA CRÍTICA AQUI: O distPath deve apontar para a raiz da sua pasta de build.
// Se seu frontend compila para `ChronoOdysseyMap/dist/client`, então `distPath` deve ser `ChronoOdysseyMap/dist`.
// E `express.static` e `res.sendFile` apontarão para `client`.
const distBase = path.join(projectRoot, 'dist'); // Assumindo que 'dist' está na raiz do projeto

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

// ROTA DO WEBHOOK DO STRIPE (ANTES DO PARSER JSON)
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log('✅ Webhook verificado com sucesso.');
  } catch (err: any) {
    console.error(`❌ Erro na verificação do webhook: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;

    if (userId) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { isPremium: true },
        });
        console.log(`✅ Usuário ${userId} agora é Premium.`);
      } catch (dbError) {
        console.error(`❌ Erro ao atualizar usuário ${userId} no banco de dados:`, dbError);
      }
    }
  }
  
  res.status(200).json({ received: true });
});

// Parser JSON (para TODAS as outras rotas) - DEPOIS DO WEBHOOK
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

// Rota dos timers premium
app.get('/api/timers', authMiddleware, async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Usuário não autenticado corretamente.' });
    }
    try {
        if (!ENABLE_TIMERS_FOR_ALL_TEMPORARILY) {
            if (!req.user.isPremium) {
                return res.status(403).json({ message: 'Acesso negado. Assinatura premium necessária.' });
            }
        }
        let whereClause: { isActive: boolean; isPremium?: boolean } = { isActive: true };
        if (!ENABLE_TIMERS_FOR_ALL_TEMPORARILY) {
            whereClause.isPremium = false;
        }
        const timers = await prisma.respawnTimer.findMany({
            where: whereClause,
            orderBy: { nextRespawnAt: 'asc' },
        });
        res.json(timers);
    } catch (error) {
        console.error('Erro ao buscar timers de respawn:', error);
        res.status(500).json({ message: 'Falha ao carregar timers de respawn.' });
    }
});


// --- ARQUIVOS ESTÁTICOS ---
// Serve os arquivos estáticos compilados pelo frontend (Vite)
// ✅ MUDANÇA: Aponta para a pasta 'client' dentro da sua pasta de build 'dist'
app.use(express.static(path.join(distBase, 'client')));




// --- ROTA DE FALLBACK (Catch-all) ---
// Esta rota deve ser a ÚLTIMA. Ela captura todas as requisições que não foram correspondidas por APIs ou arquivos estáticos.
app.get('*', (req, res) => {
    // ✅ MUDANÇA: Aponta para o index.html dentro da pasta 'client'
    res.sendFile(path.join(distBase, 'client', 'index.html'));
});




// Listener para fechar a conexão do Prisma quando o servidor encerrar
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
