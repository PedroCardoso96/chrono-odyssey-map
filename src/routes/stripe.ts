// src/routes/stripe.ts
import express from 'express';
import Stripe from 'stripe';
import 'dotenv/config'; // Garante que as variáveis de ambiente sejam carregadas
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../middleware/authMiddleware.js'; // ✅ CAMINHO CORRIGIDO com .js

const router = express.Router();
const prisma = new PrismaClient();

// Inicializa o Stripe com sua chave secreta e versão da API
// Certifique-se de que process.env.STRIPE_SECRET_KEY está definido
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil', // Use a versão mais recente da API, ou a que você já estava usando
  typescript: true,
});

// Rota para criar a sessão de checkout
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  const { priceId } = req.body;
  // ✅ MUDANÇA CRÍTICA AQUI: Agora pegamos o 'id' do req.user, que será o CUID do seu sistema
  const userId = req.user?.id;

  if (!userId) {
    // Se o middleware não injetou o ID do usuário, algo está errado na autenticação
    return res.status(401).json({ error: 'Usuário não autenticado ou ID de usuário não disponível.' });
  }
  if (!priceId) {
    return res.status(400).json({ error: 'ID do preço é obrigatório.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      // ✅ O metadata.userId agora sempre será o ID INTERNO do seu sistema (o CUID ou o ID Google para legados)
      metadata: {
        userId: userId,
      },
      // URLs de Redirecionamento Stripe
      success_url: `https://www.chronoodyssey.com.br/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://www.chronoodyssey.com.br/payment/canceled`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Erro ao criar sessão do Stripe:', error);
    res.status(500).json({ error: 'Não foi possível iniciar o pagamento.' });
  } finally {
    // REMOVIDO: Não desconecte o Prisma aqui. Deixe-o gerenciar o pool de conexões.
    // await prisma.$disconnect();
  }
});

export default router;
