"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/backend/workers/timerWorker.ts
var client_1 = require("@prisma/client");
// Crie uma instância global do PrismaClient para ser reutilizada pelo worker
// Isso evita criar e desconectar a cada intervalo.
var prisma = new client_1.PrismaClient();
// Função que contém a lógica de atualização dos timers
function updateTimersLogic() {
    return __awaiter(this, void 0, void 0, function () {
        var now, expiredTimers, updatedCount, _i, expiredTimers_1, timer, newNextRespawnAt, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("[".concat(new Date().toLocaleString(), "] Iniciando verifica\u00E7\u00E3o e atualiza\u00E7\u00E3o de timers expirados..."));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    now = new Date();
                    return [4 /*yield*/, prisma.respawnTimer.findMany({
                            where: {
                                nextRespawnAt: {
                                    lt: now, // 'less than' - menor que a data/hora atual
                                },
                                isActive: true, // Apenas timers ativos
                            },
                        })];
                case 2:
                    expiredTimers = _a.sent();
                    if (expiredTimers.length === 0) {
                        console.log("[".concat(new Date().toLocaleString(), "] Nenhum timer expirado encontrado para atualiza\u00E7\u00E3o."));
                        return [2 /*return*/];
                    }
                    console.log("[".concat(new Date().toLocaleString(), "] Encontrados ").concat(expiredTimers.length, " timers expirados. Atualizando..."));
                    updatedCount = 0;
                    _i = 0, expiredTimers_1 = expiredTimers;
                    _a.label = 3;
                case 3:
                    if (!(_i < expiredTimers_1.length)) return [3 /*break*/, 6];
                    timer = expiredTimers_1[_i];
                    newNextRespawnAt = new Date(timer.nextRespawnAt.getTime() + timer.baseRespawnSeconds * 1000);
                    // Garante que o próximo respawn esteja no futuro, mesmo se o worker atrasar
                    while (newNextRespawnAt.getTime() < now.getTime()) {
                        newNextRespawnAt = new Date(newNextRespawnAt.getTime() + timer.baseRespawnSeconds * 1000);
                    }
                    return [4 /*yield*/, prisma.respawnTimer.update({
                            where: { id: timer.id },
                            data: {
                                lastKilledAt: now,
                                nextRespawnAt: newNextRespawnAt,
                            },
                        })];
                case 4:
                    _a.sent();
                    updatedCount++;
                    console.log("[".concat(new Date().toLocaleString(), "] - Timer \"").concat(timer.entityName, "\" (ID: ").concat(timer.entityId, ") atualizado para: ").concat(newNextRespawnAt.toLocaleString()));
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    console.log("[".concat(new Date().toLocaleString(), "] \u2705 ").concat(updatedCount, " timers expirados foram atualizados com sucesso."));
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.error("[".concat(new Date().toLocaleString(), "] \u274C Erro ao atualizar timers expirados:"), error_1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
// ===================================================================
// LÓGICA DO WORKER: Executar a cada intervalo
// ===================================================================
var INTERVAL_SECONDS = 30; // Define o intervalo em segundos (ex: 30 segundos)
var INTERVAL_MS = INTERVAL_SECONDS * 1000; // Converte para milissegundos
console.log("Iniciando Timer Worker. Executando a l\u00F3gica a cada ".concat(INTERVAL_SECONDS, " segundos."));
// Executa a função imediatamente na inicialização
updateTimersLogic();
// Configura para executar a cada intervalo
setInterval(updateTimersLogic, INTERVAL_MS);
// Opcional: Lidar com o desligamento gracioso do processo
process.on('SIGINT', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('Timer Worker recebido SIGINT. Desconectando Prisma...');
                return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                console.log('Prisma desconectado. Encerrando Timer Worker.');
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); });
process.on('SIGTERM', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('Timer Worker recebido SIGTERM. Desconectando Prisma...');
                return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                console.log('Prisma desconectado. Encerrando Timer Worker.');
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); });
