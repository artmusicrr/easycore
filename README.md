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
| **API** | http://localhost:3000 | Backend Next.js |
| **pgAdmin** | http://localhost:5050 | Interface do banco |
| **PostgreSQL** | localhost:5432 | Banco de dados |

### Credenciais pgAdmin

- **Email:** `admin@admin`
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
