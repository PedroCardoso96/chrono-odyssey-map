// src/routes/auth.ts
import express, { Request, Response } from 'express';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();
const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const JWT_SECRET = process.env.JWT_SECRET || '';

console.log("[AUTH Route] JWT_SECRET carregado (primeiros 5 caracteres):", JWT_SECRET.substring(0, 5));

if (!GOOGLE_CLIENT_ID || !JWT_SECRET) {
  console.error("ERRO FATAL: As variáveis de ambiente GOOGLE_CLIENT_ID ou JWT_SECRET não estão definidas.");
  process.exit(1);
}
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

router.post('/', async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Nenhum token do Google fornecido.' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.sub) {
      console.warn("[AUTH] Verificação do token Google falhou: payload vazio ou incompleto.");
      return res.status(401).json({ success: false, message: 'Token do Google inválido ou incompleto.' });
    }

    const googleProviderAccountId = payload.sub;
    const googleEmail = payload.email;
    const googleName = payload.name || 'Usuário Anônimo';
    const googlePicture = payload.picture;

    let userInDb;
    let accountInDb;

    accountInDb = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: googleProviderAccountId,
        },
      },
      include: { user: true },
    });

    if (accountInDb) {
      userInDb = accountInDb.user;
      console.log(`[AUTH] Usuário existente ${userInDb.id} logado via Google.`);

      await prisma.user.update({
        where: { id: userInDb.id },
        data: {
          name: googleName,
          picture: googlePicture,
        },
      });

    } else {
      userInDb = await prisma.user.findUnique({
        where: { email: googleEmail },
      });

      if (userInDb) {
        console.log(`[AUTH] Nova conta Google vinculada ao usuário existente ${userInDb.id} (via e-mail).`);
        accountInDb = await prisma.account.create({
          data: {
            userId: userInDb.id,
            provider: 'google',
            providerAccountId: googleProviderAccountId,
            id_token: token,
          },
        });
      } else {
        console.log('[AUTH] Novo usuário e nova conta Google criados.');
        userInDb = await prisma.user.create({
          data: {
            email: googleEmail,
            name: googleName,
            picture: googlePicture,
            isAdmin: googleEmail === process.env.ADMIN_EMAIL,
            isPremium: false,
          },
        });

        accountInDb = await prisma.account.create({
          data: {
            userId: userInDb.id,
            provider: 'google',
            providerAccountId: googleProviderAccountId,
            id_token: token,
          },
        });
      }
    }

    // ✅ ADICIONADO: Log para depuração do status isAdmin do usuário do DB
    console.log(`[AUTH Route] Usuário ${userInDb.id} isAdmin: ${userInDb.isAdmin}`);

    const jwtToken = jwt.sign(
      { userId: userInDb.id, email: userInDb.email, isPremium: userInDb.isPremium, isAdmin: userInDb.isAdmin },
      JWT_SECRET,
      { expiresIn: '1d', algorithm: 'HS256' } // ✅ NESSA LINHA VOCÊ ESCOLHE O TEMPO DE EXPIRAÇÃO DE TOKEN PARA AS SESSÕES
    );

    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: userInDb.id,
        name: userInDb.name,
        email: userInDb.email,
        picture: userInDb.picture,
        isAdmin: userInDb.isAdmin,
        isPremium: userInDb.isPremium,
        nickname: userInDb.nickname,
        bio: userInDb.bio,
        twitchUrl: userInDb.twitchUrl,
      },
    });

  } catch (error: any) {
    console.error('Erro na rota de autenticação:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor durante a autenticação.' });
  }
});

export default router;
