// src/routes/auth.ts
import express, { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const prisma = new PrismaClient();
const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || '';
const JWT_SECRET = process.env.JWT_SECRET || '';

if (!GOOGLE_CLIENT_ID || !JWT_SECRET) {
  console.error("ERRO FATAL: Variáveis de ambiente incompletas.");
  process.exit(1);
}
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// --- HELPER: GERAÇÃO DE TOKEN JWT ---
const generateToken = (user: any) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      isPremium: user.isPremium, 
      isAdmin: user.isAdmin 
    },
    JWT_SECRET,
    { expiresIn: '1d', algorithm: 'HS256' }
  );
};

// --- ROTA GOOGLE ---
router.post('/', async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, message: 'Token Google ausente.' });

  try {
    const ticket = await client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) return res.status(401).json({ success: false });

    let user = await prisma.user.findUnique({ where: { email: payload.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name || 'Usuário',
          picture: payload.picture,
          googleId: payload.sub,
          isAdmin: payload.email === process.env.ADMIN_EMAIL,
        }
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: payload.sub, picture: payload.picture || user.picture }
      });
    }

    const jwtToken = generateToken(user);
    res.json({ success: true, token: jwtToken, user });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// --- ROTA TWITCH (UNIFICAÇÃO POR OPÇÃO OU E-MAIL) ---
router.post('/twitch', async (req: Request, res: Response) => {
  const { accessToken } = req.body;
  const authHeader = req.headers.authorization; // Captura o JWT se o usuário já estiver logado

  if (!accessToken) {
    return res.status(400).json({ success: false, message: 'AccessToken Twitch ausente.' });
  }

  try {
    // 1. Validar na Twitch
    const twitchResponse = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Client-Id': TWITCH_CLIENT_ID
      }
    });

    const twitchData = twitchResponse.data.data[0];
    if (!twitchData) return res.status(401).json({ success: false, message: 'Usuário Twitch não encontrado.' });

    const { id: twitchId, login, display_name, email: twitchEmail, profile_image_url } = twitchData;

    let user = null;

    // --- FASE 1.5: VERIFICAÇÃO DE VÍNCULO MANUAL (USUÁRIO JÁ LOGADO) ---
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        console.log(`[AUTH] Solicitado vínculo manual para o usuário ID: ${decoded.userId}`);
        
        // Atualiza o usuário logado com o novo TwitchID (mesmo que o e-mail seja diferente)
        user = await prisma.user.update({
          where: { id: decoded.userId },
          data: { 
            twitchId: twitchId,
            twitchUrl: `https://twitch.tv/${login}`
          }
        });
      } catch (jwtErr) {
        console.warn("[AUTH] JWT enviado para vínculo é inválido, tentando unificação por e-mail...");
      }
    }

    // --- FASE 1: UNIFICAÇÃO AUTOMÁTICA (SE NÃO HOUVE VÍNCULO MANUAL) ---
    if (!user) {
      user = await prisma.user.findUnique({ where: { email: twitchEmail } });

      if (user) {
        // Unifica pelo e-mail
        user = await prisma.user.update({
          where: { id: user.id },
          data: { 
            twitchId: twitchId,
            twitchUrl: `https://twitch.tv/${login}`,
            picture: user.picture || profile_image_url
          }
        });
      } else {
        // Cria novo usuário
        user = await prisma.user.create({
          data: {
            email: twitchEmail,
            name: display_name,
            twitchId: twitchId,
            twitchUrl: `https://twitch.tv/${login}`,
            picture: profile_image_url,
            isAdmin: twitchEmail === process.env.ADMIN_EMAIL,
            language: "pt",
            theme: "dark"
          }
        });
      }
    }

    const jwtToken = generateToken(user);
    res.json({
      success: true,
      token: jwtToken,
      user
    });

  } catch (error: any) {
    console.error('Erro Auth Twitch:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Falha na unificação da conta.' });
  }
});

export default router;