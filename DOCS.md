# EasyCore - Documentação

## Setup do Projeto

### Passos Realizados

1. **Configuração do Ambiente**
   - Criar arquivo `.env` baseado no `.env.example`
2. **Setup do Banco de Dados**
   - Gerar Prisma client: `npx prisma generate`
   - Criar tabelas: `npx prisma db push`
   - Popular dados iniciais: `npx prisma db seed`
3. **Iniciar Aplicação**
   - Executar: `npm run dev`
   - Acessar: [http://localhost:3333](http://localhost:3333)

### Acesso ao Banco

- **pgAdmin**: [http://localhost:5050](http://localhost:5050)
  - Login: `admin@admin.com` / `admin`

### Serviços de Infraestrutura

- **EasyPanel**: [http://localhost:3000](http://localhost:3000)
  - Instalado via: `curl -sSL https://get.easypanel.io | sudo sh`

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

#### POST /api/auth/login
```json
{
  "email": "admin@easycore.com",
  "senha": "Admin@123"
}
```

#### POST /api/users/register
```json
{
  "nome": "New User",
  "email": "newuser@example.com",
  "senha": "Password123",
  "role": "recepcao"
}
```
- `role`: `recepcao`, `dentista`, `admin`

---

### Patients

#### GET /api/patients
- Query: `?page=1&limit=20&search=nome`

#### POST /api/patients
```json
{
  "nome": "Patient Name",
  "cpf": "123.456.789-00",
  "telefone": "11999999999",
  "email": "patient@example.com",
  "consentimento_lgpd": true
}
```

---

### Treatments

#### GET /api/treatments
- Query: `?page=1&limit=20&status=aberto&patient_id=UUID`

#### POST /api/treatments
```json
{
  "patient_id": "[UUID]",
  "dentista_id": "[UUID]",
  "descricao": "Root Canal",
  "valor_total": 500.00,
  "data_inicio": "2023-12-01T10:00:00Z"
}
```

#### GET /api/treatments/[id]

#### PUT /api/treatments/[id]
```json
{
  "descricao": "Updated Description",
  "valor_total": 600.00,
  "status": "aberto"
}
```

---

### Payments

#### POST /api/payments
```json
{
  "treatment_id": "[UUID]",
  "valor_pago": 100.00,
  "forma_pagamento": "PIX",
  "observacao": "Partial payment"
}
```
- `forma_pagamento`: `PIX`, `cartao_credito`, `cartao_debito`, `dinheiro`, `boleto`, `transferencia`

#### GET /api/payments/[treatmentId]

---

### System

#### GET /api/health
- Health check do sistema e banco de dados
