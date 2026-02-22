// src/middleware/isAdmin.ts
import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function isAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1] || req.body.token;

    if (!token) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload || payload.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Acesso negado: apenas admins' });
    }

    req.user = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture
    };

    next();
  } catch (error) {
    console.error('Erro no middleware isAdmin:', error);
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}
