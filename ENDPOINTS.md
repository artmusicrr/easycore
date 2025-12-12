# EasyCore API - Documentação de Endpoints

> **Base URL:** `http://localhost:4003`

---

## 🔐 Autenticação

### POST `/api/auth/login`

Autentica um usuário e retorna um token JWT.

**Request Body:**
```json
{
  "email": "admin@easycore.com",
  "senha": "Admin@123"
}
```

**Resposta (200 OK):**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "51563146-73f1-403e-9026-987286f945e4",
    "nome": "Administrador",
    "email": "admin@easycore.com",
    "role": "admin"
  }
}
```

---

## 👥 Usuários

### POST `/api/users/register`

Registra um novo usuário no sistema.

**Request Body:**
```json
{
  "nome": "New User",
  "email": "newuser@example.com",
  "senha": "Password123",
  "role": "recepcao"
}
```

**Resposta (201 Created):**
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "01c3add7-4bd5-47a2-ae49-eeea7c645ea5",
    "nome": "New User",
    "email": "newuser@example.com",
    "role": "recepcao",
    "created_at": "2025-12-12T10:16:32.977Z"
  }
}
```

---

## 🏥 Pacientes

### POST `/api/patients`

Cadastra um novo paciente.

**Headers:**
| Header | Valor |
|--------|-------|
| `x-user-id` | UUID do usuário autenticado |

**Request Body:**
```json
{
  "nome": "Reginaldo Rodrigues",
  "cpf": "140.670.748-16",
  "telefone": "11999999999",
  "email": "artmusic@msn.com",
  "consentimento_lgpd": true
}
```

**Resposta (201 Created):**
```json
{
  "message": "Paciente cadastrado com sucesso",
  "patient": {
    "id": "4c43a726-97c5-44bd-99a7-3cad5538b8b4",
    "nome": "Reginaldo Rodrigues",
    "telefone": "11999999999",
    "email": "artmusic@msn.com",
    "consentimento_lgpd": true,
    "data_cadastro": "2025-12-12T10:17:00.879Z"
  }
}
```

---

### GET `/api/patients`

Lista todos os pacientes com paginação.

**Headers:**
| Header | Valor |
|--------|-------|
| `x-user-id` | UUID do usuário autenticado |

**Resposta (200 OK):**
```json
{
  "patients": [
    {
      "id": "7bb4a07f-1b58-4960-aa18-dab24a3a030d",
      "nome": "Carlos Oliveira",
      "telefone": "(11) 99999-9999",
      "email": "paciente@email.com",
      "data_cadastro": "2025-12-11T18:41:22.195Z",
      "consentimento_lgpd": true,
      "_count": {
        "treatments": 1
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

---

## 🦷 Tratamentos

### POST `/api/treatments`

Cria um novo tratamento.

**Headers:**
| Header | Valor |
|--------|-------|
| `x-user-id` | UUID do usuário autenticado |
| `x-user-role` | `admin` |

**Request Body:**
```json
{
  "patient_id": "4c43a726-97c5-44bd-99a7-3cad5538b8b4",
  "dentista_id": "1f08fef6-993d-453f-b80b-ffb923ffa004",
  "descricao": "Root Canal",
  "valor_total": 500.00,
  "data_inicio": "2023-12-01T10:00:00Z"
}
```

**Resposta (201 Created):**
```json
{
  "message": "Tratamento criado com sucesso",
  "treatment": {
    "id": "e8842c33-11a9-41a2-9de8-bdf3d659fec1",
    "patient_id": "4c43a726-97c5-44bd-99a7-3cad5538b8b4",
    "dentista_id": "1f08fef6-993d-453f-b80b-ffb923ffa004",
    "descricao": "Root Canal",
    "valor_total": "500",
    "valor_pago_total": "0",
    "data_inicio": "2023-12-01T10:00:00.000Z",
    "data_fim": null,
    "status": "aberto",
    "risco_inadimplencia": 0.5,
    "created_at": "2025-12-12T10:20:03.882Z",
    "updated_at": "2025-12-12T10:20:03.882Z",
    "patient": {
      "id": "4c43a726-97c5-44bd-99a7-3cad5538b8b4",
      "nome": "Reginaldo Rodrigues",
      "email": "artmusic@msn.com"
    },
    "dentista": {
      "id": "1f08fef6-993d-453f-b80b-ffb923ffa004",
      "nome": "Dr. João Oliveira"
    }
  }
}
```

---

### GET `/api/treatments`

Lista todos os tratamentos com paginação.

**Headers:**
| Header | Valor |
|--------|-------|
| `x-user-id` | UUID do usuário autenticado |
| `x-user-role` | `admin` |

**Resposta (200 OK):**
```json
{
  "treatments": [
    {
      "id": "e8842c33-11a9-41a2-9de8-bdf3d659fec1",
      "patient_id": "4c43a726-97c5-44bd-99a7-3cad5538b8b4",
      "dentista_id": "1f08fef6-993d-453f-b80b-ffb923ffa004",
      "descricao": "Updated Description",
      "valor_total": "600",
      "valor_pago_total": "100",
      "data_inicio": "2023-12-01T10:00:00.000Z",
      "data_fim": null,
      "status": "aberto",
      "risco_inadimplencia": 0.7075,
      "patient": {
        "id": "4c43a726-97c5-44bd-99a7-3cad5538b8b4",
        "nome": "Reginaldo Rodrigues"
      },
      "dentista": {
        "id": "1f08fef6-993d-453f-b80b-ffb923ffa004",
        "nome": "Dr. João Oliveira"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

---

### GET `/api/treatments/{id}`

Retorna detalhes de um tratamento específico.

**Headers:**
| Header | Valor |
|--------|-------|
| `x-user-id` | UUID do usuário autenticado |
| `x-user-role` | `admin` |

**Resposta (200 OK):**
```json
{
  "treatment": {
    "id": "e8842c33-11a9-41a2-9de8-bdf3d659fec1",
    "patient_id": "4c43a726-97c5-44bd-99a7-3cad5538b8b4",
    "dentista_id": "1f08fef6-993d-453f-b80b-ffb923ffa004",
    "descricao": "Root Canal",
    "valor_total": "500",
    "valor_pago_total": "0",
    "data_inicio": "2023-12-01T10:00:00.000Z",
    "data_fim": null,
    "status": "aberto",
    "risco_inadimplencia": 0.8,
    "patient": {
      "id": "4c43a726-97c5-44bd-99a7-3cad5538b8b4",
      "nome": "Reginaldo Rodrigues",
      "telefone": "11999999999",
      "email": "artmusic@msn.com",
      "consentimento_lgpd": true
    },
    "dentista": {
      "id": "1f08fef6-993d-453f-b80b-ffb923ffa004",
      "nome": "Dr. João Oliveira",
      "email": "joao.dentista@easycore.com"
    },
    "payments": [],
    "sessions": [],
    "financeiro": {
      "valorTotal": 500,
      "valorPago": 0,
      "saldoDevedor": 500,
      "percentualPago": 0
    },
    "risco": {
      "score": 0.8,
      "nivel": "critico"
    }
  }
}
```

---

### PUT `/api/treatments/{id}`

Atualiza um tratamento existente.

**Headers:**
| Header | Valor |
|--------|-------|
| `x-user-id` | UUID do usuário autenticado |
| `x-user-role` | `admin` |

**Request Body:**
```json
{
  "descricao": "Updated Description",
  "valor_total": 600.00,
  "status": "aberto"
}
```

**Resposta (200 OK):**
```json
{
  "message": "Tratamento atualizado com sucesso",
  "treatment": {
    "id": "e8842c33-11a9-41a2-9de8-bdf3d659fec1",
    "patient_id": "4c43a726-97c5-44bd-99a7-3cad5538b8b4",
    "dentista_id": "1f08fef6-993d-453f-b80b-ffb923ffa004",
    "descricao": "Updated Description",
    "valor_total": "600",
    "valor_pago_total": "100",
    "data_inicio": "2023-12-01T10:00:00.000Z",
    "data_fim": null,
    "status": "aberto",
    "risco_inadimplencia": 0.7075,
    "patient": {
      "id": "4c43a726-97c5-44bd-99a7-3cad5538b8b4",
      "nome": "Reginaldo Rodrigues"
    },
    "dentista": {
      "id": "1f08fef6-993d-453f-b80b-ffb923ffa004",
      "nome": "Dr. João Oliveira"
    }
  }
}
```

---

## 💰 Pagamentos

### POST `/api/payments`

Registra um novo pagamento para um tratamento.

**Headers:**
| Header | Valor |
|--------|-------|
| `x-user-id` | UUID do usuário autenticado |

**Request Body:**
```json
{
  "treatment_id": "e8842c33-11a9-41a2-9de8-bdf3d659fec1",
  "valor_pago": 100.00,
  "forma_pagamento": "PIX",
  "observacao": "Partial payment"
}
```

**Resposta (201 Created):**
```json
{
  "message": "Pagamento registrado com sucesso",
  "payment": {
    "id": "9fcc2313-ea66-4175-bf7f-e68df14f3473",
    "treatment_id": "e8842c33-11a9-41a2-9de8-bdf3d659fec1",
    "valor_pago": "100",
    "data": "2025-12-12T10:22:17.124Z",
    "forma_pagamento": "PIX",
    "recebido_por_id": "51563146-73f1-403e-9026-987286f945e4",
    "comprovante_url": null,
    "observacao": "Partial payment",
    "treatment": {
      "id": "e8842c33-11a9-41a2-9de8-bdf3d659fec1",
      "descricao": "Root Canal",
      "valor_total": "500"
    },
    "recebido_por": {
      "id": "51563146-73f1-403e-9026-987286f945e4",
      "nome": "Administrador"
    }
  },
  "treatment": {
    "id": "e8842c33-11a9-41a2-9de8-bdf3d659fec1",
    "valor_pago_total": 100,
    "valor_total": 500,
    "saldo_devedor": 400
  }
}
```

---

### GET `/api/payments/{treatment_id}`

Lista todos os pagamentos de um tratamento específico.

**Headers:**
| Header | Valor |
|--------|-------|
| `x-user-id` | UUID do usuário autenticado |
| `x-user-role` | `admin` |

**Resposta (200 OK):**
```json
{
  "treatment": {
    "id": "e8842c33-11a9-41a2-9de8-bdf3d659fec1",
    "status": "aberto",
    "valorTotal": 600,
    "valorPago": 100,
    "saldoDevedor": 500,
    "percentualPago": 16.67
  },
  "payments": [
    {
      "id": "9fcc2313-ea66-4175-bf7f-e68df14f3473",
      "treatment_id": "e8842c33-11a9-41a2-9de8-bdf3d659fec1",
      "valor_pago": "100",
      "data": "2025-12-12T10:22:17.124Z",
      "forma_pagamento": "PIX",
      "recebido_por_id": "51563146-73f1-403e-9026-987286f945e4",
      "comprovante_url": null,
      "observacao": "Partial payment",
      "recebido_por": {
        "id": "51563146-73f1-403e-9026-987286f945e4",
        "nome": "Administrador"
      }
    }
  ],
  "resumo": {
    "total_pagamentos": 1,
    "por_forma_pagamento": {
      "PIX": {
        "quantidade": 1,
        "total": 100
      }
    }
  }
}
```

---

## ❤️ Health Check

### GET `/api/health`

Verifica o status da API e conexão com banco de dados.

**Resposta (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-12T10:23:53.994Z",
  "database": "connected",
  "version": "1.0.0"
}
```

---

## 📋 Resumo dos Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/auth/login` | Autenticação de usuário |
| `POST` | `/api/users/register` | Registro de novo usuário |
| `GET` | `/api/patients` | Lista todos os pacientes |
| `POST` | `/api/patients` | Cadastra novo paciente |
| `GET` | `/api/treatments` | Lista todos os tratamentos |
| `GET` | `/api/treatments/{id}` | Detalhes de um tratamento |
| `POST` | `/api/treatments` | Cria novo tratamento |
| `PUT` | `/api/treatments/{id}` | Atualiza tratamento |
| `GET` | `/api/payments/{treatment_id}` | Lista pagamentos de um tratamento |
| `POST` | `/api/payments` | Registra novo pagamento |
| `GET` | `/api/health` | Status da API |
