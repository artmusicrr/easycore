# EasyCore - Documentação

## Setup do Projeto

### Passos Realizados

1. **Configuração do Ambiente**
   - Criar arquivo `.env` baseado no `.env.example`
2. **Setup do Banco de Dados**
   - Gerar Prisma client: `npm run prisma:generate`
   - Criar tabelas/migrations: `npm run prisma:migrate`
   - Popular dados iniciais: `npm run prisma:seed`
3. **Iniciar Aplicação**
   - Executar localmente: `npm run dev`
   - Acessar: [http://localhost:4003](http://localhost:4003) (Porta padrão configurada no `package.json`)

### Serviços e Acessos

- **Aplicação (Backend/Frontend)**: [http://localhost:4003](http://localhost:4003)
- **pgAdmin (Gestão DB)**: [http://localhost:5050](http://localhost:5050)
  - Login: `admin@admin.com` / `admin`
- **PostgreSQL**: `localhost:5432`
  - User: `adm` / Pass: `easysoft` / DB: `db_easy`

---

## Usuários de Teste

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@easycore.com` | `Admin@123` |
| Dentist | `dentista@easycore.com` | `Dentista@123` |
| Reception | `recepcao@easycore.com` | `Recepcao@123` |

---

## Status de Tratamento

| Status | Descrição |
|--------|-----------|
| `aberto` | Tratamento em andamento |
| `pago` | Tratamento totalmente pago |
| `atrasado` | Tratamento com pagamento atrasado |

---

## API Endpoints

> **Nota:** Os endpoints protegidos requerem header `Authorization: Bearer <token>`

### Authentication
- `POST /api/auth/login` - Login com email/senha
- `POST /api/auth/2fa/verify` - Verificar código 2FA (TOTP)

### Users
- `GET /api/users` - Listar usuários (Admin)
- `POST /api/users/register` - Criar novo usuário (Admin)
  - `role`: `recepcao`, `dentista`, `admin`

### Patients
- `GET /api/patients` - Listar pacientes (Busca: `?search=nome`)
- `POST /api/patients` - Cadastrar novo paciente
  - Requer: `nome`, `cpf`, `telefone`, `email`, `consentimento_lgpd`

### Treatments
- `GET /api/treatments` - Listar tratamentos (Filtros: `?status=aberto&patient_id=UUID`)
- `POST /api/treatments` - Criar novo tratamento
- `GET /api/treatments/[id]` - Detalhes do tratamento
- `PUT /api/treatments/[id]` - Atualizar status/descrição
- `GET /api/treatments/[id]/risk` - Cálculo de risco (Análise de inadimplência)

### Payments
- `POST /api/payments` - Registrar pagamento
  - `forma_pagamento`: `PIX`, `cartao_credito`, `cartao_debito`, `dinheiro`, `boleto`, `transferencia`
- `GET /api/payments/[treatmentId]` - Histórico de pagamentos de um tratamento

### Dashboard
- `GET /api/dashboard` - Métricas gerais do sistema (Admin/Recepcionista)

### Dentists
- `GET /api/dentists` - Listar dentistas ativos

### System
- `GET /api/health` - Status do sistema e conexão com o banco

---

## Estrutura de Seed (Prisma)

A estrutura de população do banco de dados (seed) foi modularizada para facilitar a manutenção e garantir a segurança dos dados.

### Arquivos
- `prisma/seed.ts`: Contém toda a **lógica** de inserção. Gerencia a ordem de criação, hash de senhas e criptografia de CPFs.
- `prisma/seed-data.ts`: Centraliza todos os **dados** (JSON/Arrays). Facilita a adição de novos usuários, pacientes e tratamentos de teste.

### Fluxo do Seed
1. **Usuários**: Cria admins, dentistas e recepcionistas. Senhas são hashadas com *bcrypt*.
2. **Pacientes**: Cadastra pacientes de teste. Os CPFs são automaticamente criptografados usando *AES-256-GCM*.
3. **Tratamentos**: Vincula pacientes aos dentistas criados.
4. **Pagamentos**: Registra transações financeiras e atualiza o saldo dos tratamentos.
5. **Auditoria**: Gera um log final informando o sucesso da operação e estatísticas dos dados inseridos.

---

## Estrutura do Projeto

O projeto utiliza uma estrutura híbrida de **Next.js 14 (App Router)**:
- `app/`: Contém a interface do usuário (Frontend).
- `src/app/api/`: Contém a implementação da API RESTful (Backend).
- `src/lib/`: Lógica de negócio, utilitários, criptografia e cliente Prisma.
- `prisma/`: Definições do banco de dados e dados de seed.
