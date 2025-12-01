import { OAuth2Client } from 'google-auth-library';
import 'dotenv/config'; // Garante que as variáveis de ambiente sejam carregadas

// ✅ NOVO: Verificação de segurança para garantir que a variável de ambiente exista na inicialização.
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) {
    console.error("ERRO FATAL: A variável de ambiente GOOGLE_CLIENT_ID não está definida no backend.");
    console.error("Verifique seu arquivo .env e se o servidor foi iniciado corretamente.");
    process.exit(1); // Encerra o processo se a variável crítica estiver faltando.
}

// ✅ CORREÇÃO: Usando a variável de ambiente correta para o backend
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
    }

    try {
        // ✅ NOVO: Adicionado log para depuração
        console.log("Tentando verificar o token com o Google...");

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID, 
        });

        // ✅ NOVO: Adicionado log de sucesso para depuração
        console.log("Token verificado com sucesso.");

        const payload = ticket.getPayload();
        if (!payload) {
            console.log("Verificação falhou: payload do token está vazio.");
            return res.status(401).json({ message: 'Token inválido.' });
        }

        req.user = payload;
        next();
        
    } catch (error) {
        console.error("Erro na verificação do token:", error);
        return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
};
