# 🗺️ Chrono Odyssey Map

Project developed for the Chrono Odyssey Closed Beta (June 2025). Currently archived pending official game launch.

![Project Status](https://img.shields.io/badge/Status-Em_Produção-success)
![License](https://img.shields.io/badge/License-All_Rights_Reserved-red)

> **Acesse o projeto online:** [🔗 chronoodysseymap.com.br](https://www.chronoodyssey.com.br/)

Um mapa interativo robusto e responsivo desenvolvido para a comunidade do MMORPG **Chrono Odyssey**. O projeto resolve a necessidade dos jogadores de localizar recursos, chefes e pontos de interesse em tempo real, oferecendo uma experiência de navegação fluida similar ao Google Maps.

---

## 📸 Screenshots


<img width="1917" height="908" alt="image" src="https://github.com/user-attachments/assets/cabdff21-ae37-4ef7-8a12-56ecd95b8d97" />

<img width="1918" height="907" alt="image" src="https://github.com/user-attachments/assets/beda529e-7cf8-4f5d-b86f-992036a94d2b" />


---

## 🚀 Diferenciais Técnicos & Funcionalidades

Este não é apenas um mapa estático. O projeto conta com funcionalidades avançadas:

* **🗺️ Renderização de Alta Performance:** Utilização de lazy loading para carregar o mapa (tiling) sem travar o navegador, mesmo com alta densidade de marcadores.
* **🔍 Filtros Dinâmicos:** Sistema de filtragem instantânea por categoria (Recursos, Bosses, NPCs) gerenciado via estado global.
* **📱 Design Responsivo:** Interface totalmente adaptada para Mobile e Desktop.
* **⚡ Backend Otimizado:** Integração com Prisma ORM para consultas rápidas ao banco de dados PostgreSQL.

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, TypeScript
* **Estilização:** Tailwind CSS (para UI moderna e leve)
* **Backend/DB:** Prisma ORM, PostgreSQL
* **Infraestrutura:** VPS Linux (Ubuntu) com CloudPanel, Nginx

---

## 👥 Autores & Colaboração

Este projeto foi desenvolvido em dupla, combinando especialidades para entregar uma aplicação completa:

* **Pedro Cardoso** ([@PedroCardoso96](https://github.com/PedroCardoso96))
    * **Foco Principal (Frontend & UI/UX):** Responsável pela arquitetura dos componentes React, criação da maioria das páginas, interatividade do mapa e design responsivo.
    * **Contribuições Backend:** Configuração de infraestrutura (VPS), deploy e estruturação de rotas iniciais.

* **Denis** ([@denishark333](https://github.com/denishark333))
    * **Foco Principal (Backend & Integrações):** Liderou a implementação de lógicas complexas do servidor, sistemas de autenticação, bots de automação e integração de pagamentos.
    * **Contribuições Frontend:** Auxílio no desenvolvimento de páginas específicas e funcionalidades visuais.

---

## ⚠️ Nota Legal (Copyright)

Todo o código fonte presente neste repositório é de propriedade intelectual dos autores mencionados.
Embora o repositório seja público para fins de portfólio e estudo:
1.  **Não é permitida** a cópia total ou parcial para criação de sites concorrentes ou comerciais.
2.  O uso dos *assets* (imagens do mapa) segue os direitos da desenvolvedora do jogo Chrono Odyssey.

---

## ⚙️ Rodando Localmente

```bash
# Clone o projeto
git clone [https://github.com/PedroCardoso96/chrono-odyssey-map.git](https://github.com/PedroCardoso96/chrono-odyssey-map.git)

# Instale as dependências
npm install

# Configure o .env (baseado no exemplo)
# Inicie o servidor
npm run dev
