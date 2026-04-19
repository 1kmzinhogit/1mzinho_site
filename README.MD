# 1kmzinho - Guia de Instalacao e Configuracao

Este projeto possui duas aplicacoes:
- `frontend` na raiz com Next.js
- `backend` em `api/` com Express + Prisma + PostgreSQL + Mercado Pago

## Requisitos

- Node.js 20+ (recomendado)
- npm 10+ (ou equivalente)
- PostgreSQL em execucao
- Conta do Mercado Pago (para obter token de acesso)
- (Opcional em dev) ngrok para receber webhook local

## Estrutura principal

- `./` - App web (Next.js)
- `api/` - API de pagamentos (Express + Prisma)
- `api/src/` - Codigo-fonte da API (padrao organizado)
- `api/prisma/schema.prisma` - Schema do banco

## 1) Instalar dependencias

No frontend (raiz):

```bash
npm install
```

No backend:

```bash
cd api
npm install
```

## 2) Configurar variaveis de ambiente

### Frontend (raiz)

Crie um arquivo `.env.local` na raiz:

```env
# URL da API usada pelo frontend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Backend (`api/.env`)

Crie um arquivo `.env` dentro de `api/`:

```env
# Conexao PostgreSQL para o Prisma
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/NOME_DO_BANCO?schema=public"

# Token de acesso do Mercado Pago
MP_ACCESS_TOKEN="SEU_TOKEN_DO_MERCADO_PAGO"

# URL publica/base usada para back_urls e notification_url
# Em desenvolvimento pode ser localhost, mas para webhook real use URL publica (ex.: ngrok)
APP_URL="http://localhost:3000"

# Opcional
NODE_ENV=development
```

## 3) Preparar banco de dados (Prisma)

Dentro de `api/`:

```bash
npx prisma generate
npx prisma db push
```

Comandos uteis:

```bash
# validar schema
npx prisma validate

# abrir interface visual do banco
npx prisma studio
```

## 4) Rodar projeto em desenvolvimento

### Backend (porta 3000)

Dentro de `api/`:

```bash
npm run dev
```

### Frontend

Na raiz:

```bash
npm run dev
```

Por padrao, o frontend consulta a API via `NEXT_PUBLIC_API_URL` (com fallback para `http://localhost:3000` em alguns fluxos).

## 5) Webhook do Mercado Pago em ambiente local

Para o webhook funcionar localmente, e necessario uma URL publica apontando para sua API.

Exemplo com ngrok:

```bash
ngrok http 3000
```

Depois:
- copie a URL HTTPS gerada pelo ngrok
- atualize `APP_URL` em `api/.env` com essa URL
- reinicie a API

O webhook esperado pela API:
- `POST /webhooks/mercadopago`

## Scripts disponiveis

### Frontend (raiz)

- `npm run dev` - desenvolvimento
- `npm run build` - build de producao
- `npm run start` - inicia build
- `npm run lint` - lint do projeto

### Backend (`api/`)

- `npm run dev` - API com hot reload via `ts-node-dev`
- `npm run build` - compila TypeScript para `dist/`
- `npm run start` - inicia API compilada (`dist/app.js`)

## Fluxo de pagamento (resumo)

1. Front chama `POST /checkout`
2. API cria pedido no banco e cria preferencia no Mercado Pago
3. Usuario finaliza pagamento no Mercado Pago
4. Mercado Pago chama `POST /webhooks/mercadopago`
5. API atualiza status do pedido e registra pagamento

## Troubleshooting rapido

- Erro de conexao no Prisma:
  - confira `DATABASE_URL`
  - verifique se o PostgreSQL esta rodando
  - rode `npx prisma db push` novamente

- Erro de autenticacao Mercado Pago:
  - valide `MP_ACCESS_TOKEN`
  - confirme ambiente da credencial (teste/producao)

- Webhook nao chega:
  - confirme se `APP_URL` e publico (ngrok em dev)
  - confira se a rota `/webhooks/mercadopago` esta acessivel externamente

## Observacoes importantes

- O frontend esta com `reactStrictMode: true` no `next.config.mjs`, seguindo pratica recomendada para producao.
- O Prisma Client e gerado em `api/generated/prisma/client`.

## Deploy separado (Frontend + API)

### Frontend na Vercel (raiz)

Configure o projeto na Vercel apontando para a raiz `./`:
- Root Directory: `./`
- Build Command: `npm run build`
- Output padrão do Next.js (automatico)

Variaveis no projeto da Vercel (frontend):
- `NEXT_PUBLIC_API_URL=https://SUA-API-URL`

### API em servico separado (`api/`)

Pode subir em Railway, Render, Fly.io, VPS ou outro provedor Node.

Configuracao base:
- Root Directory: `api`
- Install Command: `npm install`
- Build Command: `npm run build`
- Start Command: `npm run start`

Variaveis obrigatorias da API:
- `DATABASE_URL`
- `MP_ACCESS_TOKEN`
- `APP_URL` (URL publica da propria API para webhook/callback)
- `NODE_ENV=production`

Checklist rapido:
1. Rodar migracao/sync do schema no banco de producao (`npx prisma db push` no ambiente da API).
2. Garantir que a rota `POST /webhooks/mercadopago` esteja publica.
3. Configurar `NEXT_PUBLIC_API_URL` no frontend apontando para a API publicada.
