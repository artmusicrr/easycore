<<<<<<< HEAD
# 🦷 EasyCore

Backend para sistema de gestão odontológica desenvolvido com **Next.js 14**, **Prisma ORM** e **PostgreSQL 15**, totalmente containerizado com Docker.

## 📋 Tecnologias

- **Next.js 14** - Framework React com App Router
- **Prisma ORM** - ORM type-safe para PostgreSQL
- **PostgreSQL 15** - Banco de dados relacional
- **Docker & Docker Compose** - Containerização
- **TypeScript** - Tipagem estática
- **bcryptjs** - Hash de senhas
- **JWT** - Autenticação stateless
- **Zod** - Validação de schemas

## 🗂️ Estrutura do Projeto

```
easycore/
├── prisma/
│   ├── schema.prisma      # Schema do banco de dados
│   ├── seed.ts            # Dados iniciais
│   └── tsconfig.json      # Config TypeScript para seed
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/      # Autenticação (login, 2FA)
│   │   │   ├── health/    # Health check
│   │   │   ├── patients/  # CRUD de pacientes
│   │   │   ├── payments/  # Gestão de pagamentos
│   │   │   ├── treatments/# Gestão de tratamentos
│   │   │   └── users/     # Gestão de usuários
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   ├── audit.ts       # Logs de auditoria
│   │   ├── crypto.ts      # Criptografia AES-256 (CPF)
│   │   ├── jwt.ts         # Geração/validação de tokens
│   │   ├── payments.ts    # Lógica de pagamentos
│   │   ├── prisma.ts      # Cliente Prisma singleton
│   │   └── risk.ts        # Cálculo de risco (placeholder IA)
│   └── middleware.ts      # Proteção de rotas
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── package.json
```

## 🚀 Início Rápido

### Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 20+ (para desenvolvimento local)

### 1. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` e configure:
- `JWT_SECRET` - Chave secreta para tokens (mínimo 32 caracteres)
- `ENCRYPTION_KEY` - Chave AES-256 (exatamente 32 caracteres)

### 2. Iniciar os containers

```bash
# Produção
docker compose up -d

# Desenvolvimento (com hot reload)
docker compose --profile dev up -d
```

### 3. Executar migrations e seed

```bash
# Se estiver usando o container de dev
docker compose exec easycore-dev npx prisma migrate deploy
docker compose exec easycore-dev npx prisma db seed

# Ou localmente
npx prisma migrate deploy
npx prisma db seed
```

## 🔗 Endpoints

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **API** | http://localhost:3333 | Backend Next.js |
| **pgAdmin** | http://localhost:5050 | Interface do banco |
| **PostgreSQL** | localhost:5432 | Banco de dados |

### Credenciais pgAdmin

- **Email:** `admin@admin.com`
- **Senha:** `admin`

### Conexão PostgreSQL (no pgAdmin)

- **Host:** `postgres`
- **Port:** `5432`
- **Username:** `adm`
- **Password:** `easysoft`
- **Database:** `db_easy`

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login com email/senha
- `POST /api/auth/2fa/verify` - Verificar código 2FA

### Usuários
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário

### Pacientes
- `GET /api/patients` - Listar pacientes
- `POST /api/patients` - Cadastrar paciente

### Tratamentos
- `GET /api/treatments` - Listar tratamentos
- `POST /api/treatments` - Criar tratamento
- `GET /api/treatments/[id]/risk` - Calcular risco de inadimplência

### Pagamentos
- `GET /api/payments` - Listar pagamentos
- `POST /api/payments` - Registrar pagamento

### Health
- `GET /api/health` - Status da aplicação

## 👥 Roles do Sistema

| Role | Descrição |
|------|-----------|
| `admin` | Acesso total ao sistema |
| `dentista` | Gerencia tratamentos e visualiza pacientes |
| `recepcao` | Cadastra pacientes e registra pagamentos |

## 🔐 Segurança

- **Senhas** hashadas com bcrypt (12 rounds)
- **CPF** criptografado com AES-256-GCM
- **JWT** para autenticação stateless
- **2FA** opcional via TOTP
- **Auditoria** completa de ações sensíveis
- **LGPD** - Consentimento obrigatório dos pacientes

## 🛠️ Scripts Disponíveis

```bash
npm run dev              # Inicia servidor de desenvolvimento
npm run build            # Build de produção
npm run prisma:generate  # Gera cliente Prisma
npm run prisma:migrate   # Executa migrations (dev)
npm run prisma:seed      # Popula banco com dados iniciais
npm run prisma:studio    # Abre Prisma Studio
npm run db:push          # Push do schema sem migration
```

## 📝 Licença

Projeto privado - Todos os direitos reservados.
=======
# EasyFront

Frontend do sistema de gestão odontológica.

## 🚀 Quick Start

### Com Docker

```bash
# Copiar variáveis de ambiente
cp .env.example .env

# Subir o container
docker compose up -d

# Ver logs
docker compose logs -f

# Parar
docker compose down
```

O frontend estará disponível em: **http://localhost:3001**

### Desenvolvimento Local

```bash
npm install
npm run dev
```

## 📋 Variáveis de Ambiente

- `NEXT_PUBLIC_API_URL`: URL da API do backend (padrão: http://localhost:4003/api)
- `FRONTEND_PORT`: Porta do frontend (padrão: 3001)

## 🔧 Tecnologias

- Next.js 14
- TypeScript
- TailwindCSS
- React Query
- Axios
- React Hook Form
- Zod

## 📦 Build

```bash
# Build local
npm run build

# Build Docker
docker compose build
```
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
>>>>>>> bdc9cb7f7ba6c3f58044f8598548ea081638752c
