<div align="center">

# ⚽ Gestão de Quadra

**Controle de mensalidades, pagamentos e finanças para grupos de futebol / quadra esportiva.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql&logoColor=white)](https://neon.tech)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## 📋 Sobre

App web para administrar um grupo de jogadores de quadra. Dois lados:

- **Público** — qualquer jogador vê o status das mensalidades do mês (pago / não pago / não compareceu) e a chave PIX.
- **Diretoria** — painel protegido por login para gerenciar jogadores, registrar pagamentos, lançar despesas e acompanhar o resumo financeiro do mês.

## ✨ Funcionalidades

- 👥 **Mensalistas & avulsos** — cadastro de jogadores com tipo, status ativo e flag de diretoria
- 💰 **Controle de pagamentos** — status mensal por jogador com data de pagamento
- 🧾 **Despesas** — lançamento de custos fixos e variáveis por mês
- 📊 **Resumo financeiro** — arrecadação vs. despesas do período
- ⚙️ **Configuração** — dia de fechamento, valor da mensalidade, chave PIX e URL da página
- 🔐 **Autenticação** — área da diretoria protegida via [Better Auth](https://www.better-auth.com)

## 🛠️ Stack

| Camada    | Tecnologia                                 |
| --------- | ------------------------------------------ |
| Framework | Next.js 16 (App Router, Server Actions)    |
| UI        | React 19, Tailwind CSS 4, shadcn / Base UI |
| Ícones    | lucide-react                               |
| Banco     | PostgreSQL (Neon)                          |
| ORM       | Prisma 7 (`@prisma/adapter-pg`)            |
| Auth      | Better Auth + adapter Prisma               |
| Analytics | Vercel Analytics                           |

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- [pnpm](https://pnpm.io)
- Banco PostgreSQL (recomendado [Neon](https://neon.tech))

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Variáveis de ambiente

Crie `.env` na raiz:

```env
DATABASE_URL="postgresql://usuario:senha@host/db?sslmode=require"
BETTER_AUTH_URL="http://localhost:3000"
```

### 3. Configurar banco

Gera o client, aplica migrations e roda o seed:

```bash
pnpm db:setup
```

### 4. Rodar

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000). Painel da diretoria em `/diretoria`.

## 📜 Scripts

| Comando                | Descrição                                  |
| ---------------------- | ------------------------------------------ |
| `pnpm dev`             | Servidor de desenvolvimento                |
| `pnpm build`           | Build de produção                          |
| `pnpm start`           | Servidor de produção                       |
| `pnpm lint`            | ESLint                                     |
| `pnpm prisma:generate` | Gera o Prisma Client                       |
| `pnpm prisma:migrate`  | Aplica migrations em dev                   |
| `pnpm prisma:seed`     | Popula o banco com dados iniciais          |
| `pnpm prisma:studio`   | Abre o Prisma Studio                       |
| `pnpm db:setup`        | generate + migrate + seed (setup completo) |

## 📁 Estrutura

```
gestao-de-quadra/
├── app/
│   ├── actions/          # Server Actions (config, payments, players, setup)
│   ├── diretoria/        # Área autenticada (login, painel, signout)
│   ├── layout.tsx
│   └── page.tsx          # View pública de mensalistas
├── components/
│   ├── diretoria/        # Componentes do painel
│   ├── ui/               # Componentes base (shadcn / Base UI)
│   └── *.tsx
├── lib/
│   ├── auth.ts           # Config Better Auth (server)
│   ├── auth-client.ts    # Config Better Auth (client)
│   ├── prisma.ts         # Instância do Prisma
│   └── utils.ts
└── prisma/
    ├── schema.prisma     # Modelo de dados
    ├── migrations/
    └── seed.ts
```

## 🗄️ Modelo de dados

- **Player** — jogadores (`mensalista` / `avulso`), com flags de diretoria e mensalidade
- **Payment** — pagamento por jogador/mês/ano (`pago` / `nao_pago` / `nao_compareceu`)
- **Expense** — despesas do mês (fixas ou variáveis)
- **Config** — dia de fechamento, valor da mensalidade, chave PIX
- **User / Session / Account / Verification** — tabelas do Better Auth

---

<div align="center">
<sub>Feito para simplificar a vida de quem administra o time. 🏟️</sub>
</div>
