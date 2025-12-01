// middleware/isAdmin.ts
import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // ✅ ADICIONADO: Log para depuração do status isAdmin no middleware
  console.log(`[isAdmin Middleware] req.user existe: ${!!req.user}, isAdmin: ${req.user?.isAdmin}`);

  if (req.user && req.user.isAdmin) {
    next(); // Usuário é admin, prossegue para a próxima função de middleware/rota
  } else {
    return res.status(403).json({ message: 'Acesso negado. Requer privilégios de administrador.' });
  }
};
