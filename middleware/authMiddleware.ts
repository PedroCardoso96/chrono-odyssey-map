// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || '';

console.log("[AUTH_MIDDLEWARE] JWT_SECRET carregado (primeiros 5 caracteres):", JWT_SECRET.substring(0, 5));

if (!JWT_SECRET) {
  console.error("ERRO FATAL: A variável de ambiente JWT_SECRET não está definida no backend. É crucial para a segurança dos JWTs.");
  process.exit(1);
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        isPremium?: boolean;
        isAdmin?: boolean;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  try {
    // ✅ MUDANÇA: Especifica o algoritmo HS256
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as { userId: string; email?: string; isPremium?: boolean; isAdmin?: boolean };

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      isPremium: decoded.isPremium,
      isAdmin: decoded.isAdmin,
    };
    next();

  } catch (error: any) {
    console.error("[AUTH_MIDDLEWARE] Erro na verificação do JWT:", error);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expirado. Por favor, faça login novamente.' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ message: 'Token inválido. Por favor, faça login novamente.' });
    }
    return res.status(500).json({ message: 'Erro interno do servidor na autenticação.' });
  }
};
