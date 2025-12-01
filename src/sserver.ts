// src/server.ts
import express from 'express';
import path from 'path';
import fs from 'fs';
import https from 'https';
import dotenv from 'dotenv';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import markerRoutes from './routes/markers.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializa variáveis de ambiente
dotenv.config();

const app = express();
const prisma = new PrismaClient(); // Instância do Prisma para interagir com o DB
const PORT = process.env.PORT || 3001;
const HOSTNAME = process.env.HOSTNAME || 'localhost';

// Define a raiz do projeto (uma pasta acima de __dirname, que é src/)
const rootDir = path.resolve(__dirname, '..');

// Middlewares globais
const corsOptions: cors.CorsOptions = {
    origin: ['https://www.chronoodyssey.com.br', 'https://chronoodyssey.com.br'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

if (process.env.NODE_ENV !== 'production') {
    corsOptions.origin = ['http://localhost:5173', 'http://localhost:3001'];
}

app.use(cors(corsOptions));
app.use(express.json());

// HTTPS redirect e headers de segurança (apenas se tiver proxy reverso como NGINX)
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
        return res.redirect(`https://${req.header('host')}${req.url}`);
    }

    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', 'upgrade-insecure-requests');
    next();
});

// Arquivos estáticos
app.use('/ads.txt', express.static(path.join(rootDir, 'ads.txt')));
app.use('/robots.txt', express.static(path.join(rootDir, 'robots.txt')));
app.use('/tiles', express.static(path.join(rootDir, 'public/tiles')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/markers', markerRoutes);

// NOVO ENDPOINT para buscar timers de respawn (Premium)
app.get('/api/timers', async (req, res) => {
    // ----------------------------------------------------------------------------------
    // LÓGICA DE VERIFICAÇÃO DE USUÁRIO PREMIUM
    // ESTE É UM PLACEHOLDER! Você precisará integrar com sua lógica de autenticação.
    // Ex: Você pode ter um middleware de autenticação que anexa o `user` logado ao `req`.
    // Por enquanto, vamos SIMULAR o acesso premium para que você possa testar o endpoint.
    // ----------------------------------------------------------------------------------
    const isUserAuthenticatedAndPremium = true; // <--- Mude para 'false' para simular não-premium

    if (!isUserAuthenticatedAndPremium) {
        return res.status(403).json({ message: 'Access denied. Premium subscription required.' });
    }

    try {
        const timers = await prisma.respawnTimer.findMany({
            where: {
                isPremium: true, // Filtra apenas timers marcados como premium
                isActive: true,  // Filtra apenas timers ativos
            },
            orderBy: {
                nextRespawnAt: 'asc', // Ordena pelo próximo respawn
            },
        });

        // Se o banco de dados estiver vazio, fornece alguns dados mockados para teste
        if (timers.length === 0) {
            console.warn("Nenhum timer premium ativo encontrado no DB. Retornando dados mockados para teste.");
            return res.json([
                {
                    id: 'mock-timer-boss-1',
                    entityId: 'BOSS_DRAKE',
                    entityName: 'Drake of the Whispering Peaks',
                    category: 'Field Boss',
                    location: 'Northern Peaks',
                    lat: 120.5,
                    lng: 300.7,
                    baseRespawnSeconds: 10800, // 3 horas
                    lastKilledAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // Morto há 1 hora
                    nextRespawnAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Daqui a 2 horas
                    isActive: true,
                    isPremium: true,
                    mapSection: 'Setera',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'mock-timer-resource-1',
                    entityId: 'RARE_ORE_NODE',
                    entityName: 'Luminous Platinum Vein',
                    category: 'Ores',
                    location: 'Sunken Caverns Entrance',
                    lat: 500.1,
                    lng: 150.2,
                    baseRespawnSeconds: 2700, // 45 minutos
                    lastKilledAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // Coletado há 15 minutos
                    nextRespawnAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // Daqui a 30 minutos
                    isActive: true,
                    isPremium: true,
                    mapSection: 'Setera',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ]);
        }

        res.json(timers);
    } catch (error) {
        console.error('Erro ao buscar timers de respawn:', error);
        res.status(500).json({ message: 'Falha ao carregar timers de respawn.' });
    }
});

// NOVO ENDPOINT para proxy da Steam News (já estava no seu código, mantido)
app.get('/api/steam-news', async (req, res) => {
    try {
        const steamRes = await fetch('https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=2873440&count=1&maxlength=0');
        if (!steamRes.ok) {
            return res.status(steamRes.status).json({ error: 'Erro na Steam API' });
        }
        const data = await steamRes.json();
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar notícia da Steam:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});


// SPA React (build gerado em rootDir/dist)
app.use(express.static(path.join(rootDir, 'dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(rootDir, 'dist', 'index.html'));
});

// Inicia servidor HTTP ou HTTPS
if (process.env.NODE_ENV === 'production') {
    const sslKeyPath = process.env.SSL_KEY_PATH || '';
    const sslCertPath = process.env.SSL_CERT_PATH || '';

    if (!fs.existsSync(sslKeyPath) || !fs.existsSync(sslCertPath)) {
        console.error('Caminhos SSL inválidos. Verifique as variáveis SSL_KEY_PATH e SSL_CERT_PATH.');
        process.exit(1);
    }

    const options = {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath)
    };

    https.createServer(options, app).listen(443, () => {
        console.log(`Servidor HTTPS rodando em https://${HOSTNAME}`);
    });
} else {
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
}