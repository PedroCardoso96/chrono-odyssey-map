#!/bin/bash

# Define o diretório raiz do projeto
PROJECT_ROOT="/home/adminn/htdocs/map/ChronoOdysseyMap"

# Define o caminho do arquivo de log
LOG_FILE="${PROJECT_ROOT}/cron_timers.log"

# Define o caminho do script Node.js a ser executado
NODE_SCRIPT="${PROJECT_ROOT}/prisma/cronUpdateTimers.mjs"

# Define o caminho do Node.js (geralmente /usr/bin/node)
NODE_EXECUTABLE="/usr/bin/node"

# --- Lógica de Execução ---

# Navega para o diretório raiz do projeto para que o Node.js encontre as dependências
# Redireciona a saída de erro do 'cd' para o log
cd "${PROJECT_ROOT}" || { echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERRO: Nao foi possivel navegar para o diretorio do projeto (${PROJECT_ROOT})." >> "${LOG_FILE}" 2>&1; exit 1; }

# Executa o script Node.js e redireciona toda a saída (stdout e stderr) para o arquivo de log
# A data/hora sera adicionada pelo script Node.js interno
"${NODE_EXECUTABLE}" "${NODE_SCRIPT}" >> "${LOG_FILE}" 2>&1
