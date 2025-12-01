# 🚀 Guia de Deploy para Produção

Este guia explica como fazer o deploy do Chrono Odyssey Map para produção.

## ✅ **Problema Resolvido**

O erro `terser not found` foi resolvido de duas formas:

1. **Instalação do terser**: `npm install --save-dev terser`
2. **Configuração alternativa**: Usando `esbuild` (mais rápido) em vez de `terser`

## 📋 **Pré-requisitos**

- Node.js 18+ instalado
- Acesso ao servidor de produção
- Domínio configurado (ex: chronoodyssey.com.br)

## 🔧 **Passos para Deploy**

### **1. Preparação Local**

```bash
# Instalar dependências
npm install

# Build completo (frontend + backend)
npm run build
```

### **2. Estrutura de Arquivos para Produção**

Após o build, você terá:

```
dist/
├── index.html                    # Página principal
├── assets/
│   ├── css/                      # Estilos otimizados
│   └── js/                       # JavaScript otimizado
├── server.js                     # Servidor backend
└── prisma/
    └── dev.db                    # Banco de dados SQLite
```

### **3. Upload para o Servidor**

```bash
# Conectar ao servidor
ssh root@srv853475

# Navegar para o diretório
cd /home/adminn/htdocs/map/ChronoOdysseyMap

# Fazer backup (opcional)
cp -r dist dist_backup_$(date +%Y%m%d)

# Upload dos arquivos (via FTP/SCP ou git pull)
# Se usando git:
git pull origin main
npm install
npm run build
```

### **4. Configuração do Servidor**

#### **Arquivo .env de Produção**
```env
# Produção
NODE_ENV=production
PORT=3001
GOOGLE_CLIENT_ID=seu_client_id_aqui
DATABASE_URL="file:./prisma/dev.db"
```

#### **Configuração do PM2 (Recomendado)**
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Criar arquivo ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'chrono-map',
    script: 'dist/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
EOF

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### **5. Configuração do Nginx/Apache**

#### **Nginx (Recomendado)**
```nginx
server {
    listen 80;
    server_name chronoodyssey.com.br www.chronoodyssey.com.br;
    
    # Redirecionar para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name chronoodyssey.com.br www.chronoodyssey.com.br;
    
    # SSL (configurar certificado)
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Root do projeto
    root /home/adminn/htdocs/map/ChronoOdysseyMap/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Tiles do mapa
    location /tiles/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Páginas SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### **Apache (.htaccess)**
```apache
RewriteEngine On

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache para assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
</IfModule>

# SPA routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### **6. Verificações Pós-Deploy**

```bash
# Verificar se o servidor está rodando
pm2 status

# Verificar logs
pm2 logs chrono-map

# Testar API
curl http://localhost:3001/api/markers

# Verificar se o site está acessível
curl -I https://chronoodyssey.com.br
```

## 🔍 **Troubleshooting**

### **Erro: terser not found**
```bash
# Solução 1: Instalar terser
npm install --save-dev terser

# Solução 2: Usar esbuild (já configurado)
# O vite.config.ts já está configurado para usar esbuild
```

### **Erro: Port already in use**
```bash
# Verificar processos na porta
lsof -i :3001

# Matar processo se necessário
kill -9 <PID>

# Ou usar porta diferente
PORT=3002 npm run build
```

### **Erro: Database connection**
```bash
# Verificar se o banco existe
ls -la dist/prisma/

# Se não existir, copiar do desenvolvimento
cp prisma/dev.db dist/prisma/
```

### **Erro: Permission denied**
```bash
# Dar permissões adequadas
chmod 755 dist/
chmod 644 dist/*.js
chmod 644 dist/*.html
```

## 📊 **Monitoramento**

### **Logs**
```bash
# Logs em tempo real
pm2 logs chrono-map --lines 100

# Logs de erro
pm2 logs chrono-map --err --lines 50
```

### **Performance**
```bash
# Status do PM2
pm2 monit

# Uso de memória
pm2 show chrono-map
```

### **SSL/HTTPS**
```bash
# Verificar certificado SSL
openssl s_client -connect chronoodyssey.com.br:443 -servername chronoodyssey.com.br
```

## 🚀 **Deploy Automatizado (Opcional)**

### **Script de Deploy**
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Iniciando deploy..."

# Pull das mudanças
git pull origin main

# Instalar dependências
npm install

# Build
npm run build

# Backup
cp -r dist dist_backup_$(date +%Y%m%d_%H%M%S)

# Reiniciar PM2
pm2 restart chrono-map

echo "✅ Deploy concluído!"
```

### **GitHub Actions (Opcional)**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.KEY }}
          script: |
            cd /home/adminn/htdocs/map/ChronoOdysseyMap
            git pull origin main
            npm install
            npm run build
            pm2 restart chrono-map
```

## 🎉 **Resultado**

Após seguir este guia, você terá:

✅ **Site funcionando em produção**  
✅ **SSL/HTTPS configurado**  
✅ **Performance otimizada**  
✅ **Monitoramento ativo**  
✅ **Deploy automatizado**  

O site estará disponível em: `https://chronoodyssey.com.br` 