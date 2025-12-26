// ================================
// EasyCore - Dados para Seed
// Centralize aqui todos os dados para popular o banco
// ================================

import { Role, PaymentMethod } from '@prisma/client';

// ================================
// USUÁRIOS
// ================================
export const users = [
  {
    nome: 'Administrador',
    email: 'admin@easycore.com',
    senha: 'Admin@123',
    role: Role.admin,
  },
  {
    nome: 'Admin Master',
    email: 'admin@example.com',
    senha: 'Password123',
    role: Role.admin,
  },
  {
    nome: 'Admin Secundário',
    email: 'admin2@example.com',
    senha: 'Password123',
    role: Role.admin,
  },
  {
    nome: 'Recepção Principal',
    email: 'recepcao1@example.com',
    senha: 'Password123',
    role: Role.recepcao,
  },
  {
    nome: 'Recepção Backup',
    email: 'recepcao2@example.com',
    senha: 'Password123',
    role: Role.recepcao,
  },
  {
    nome: 'Dentista Carlos',
    email: 'carlos.dentista@example.com',
    senha: 'Password123',
    role: Role.dentista,
  },
  {
    nome: 'Dentista Ana',
    email: 'ana.dentista@example.com',
    senha: 'Password123',
    role: Role.dentista,
  },
  {
    nome: 'Dentista Rafael',
    email: 'rafael.dentista@example.com',
    senha: 'Password123',
    role: Role.dentista,
  },
];

// ================================
// PACIENTES
// ================================
export const patients = [
  {
    nome: 'Reginaldo Rodrigues',
    cpf: '645.228.460-61',
    telefone: '11999999999',
    email: 'artmusic@msn.com',
    consentimento_lgpd: true,
  },
  {
    nome: 'Juliana Martins',
    cpf: '991.893.170-17',
    telefone: '11988887777',
    email: 'juliana.martins@gmail.com',
    consentimento_lgpd: true,
  },
  {
    nome: 'Carlos Eduardo Silva',
    cpf: '043.761.240-60',
    telefone: '11977776666',
    email: 'carlos.silva@hotmail.com',
    consentimento_lgpd: true,
  },
  {
    nome: 'Fernanda Oliveira',
    cpf: '999.653.290-95',
    telefone: '11966665555',
    email: 'fernanda.oliveira@yahoo.com',
    consentimento_lgpd: true,
  },
  {
    nome: 'Marcos Vinícius Lima',
    cpf: '168.884.140-78',
    telefone: '11955554444',
    email: 'marcos.lima@gmail.com',
    consentimento_lgpd: true,
  },
  {
    nome: 'Ana Paula Costa',
    cpf: '455.592.120-83',
    telefone: '11944443333',
    email: 'ana.costa@gmail.com',
    consentimento_lgpd: true,
  },
  {
    nome: 'Rafael Pereira',
    cpf: '426.033.220-10',
    telefone: '11933332222',
    email: 'rafael.pereira@outlook.com',
    consentimento_lgpd: true,
  },
  {
    nome: 'Patrícia Nogueira',
    cpf: '834.924.630-88',
    telefone: '11922221111',
    email: 'patricia.nogueira@gmail.com',
    consentimento_lgpd: true,
  },
  {
    nome: 'Lucas Almeida',
    cpf: '551.509.820-08',
    telefone: '11911112222',
    email: 'lucas.almeida@gmail.com',
    consentimento_lgpd: true,
  },
  {
    nome: 'Camila Rocha',
    cpf: '767.732.400-26',
    telefone: '11900009999',
    email: 'camila.rocha@hotmail.com',
    consentimento_lgpd: true,
  },
];

// ================================
// TRATAMENTOS
// ================================
// Nota: dentista_email e patient_email serão usados para buscar os IDs
export const treatments = [
  {
    patient_email: 'artmusic@msn.com',
    dentista_email: 'carlos.dentista@example.com',
    descricao: 'Avaliação inicial',
    valor_total: 150.00,
    data_inicio: new Date('2025-12-19T09:00:00Z'),
  },
  {
    patient_email: 'juliana.martins@gmail.com',
    dentista_email: 'ana.dentista@example.com',
    descricao: 'Limpeza e profilaxia',
    valor_total: 200.00,
    data_inicio: new Date('2025-12-19T10:30:00Z'),
  },
  {
    patient_email: 'carlos.silva@hotmail.com',
    dentista_email: 'rafael.dentista@example.com',
    descricao: 'Restauração simples',
    valor_total: 250.00,
    data_inicio: new Date('2025-12-20T14:00:00Z'),
  },
  {
    patient_email: 'fernanda.oliveira@yahoo.com',
    dentista_email: 'carlos.dentista@example.com',
    descricao: 'Extração dentária',
    valor_total: 300.00,
    data_inicio: new Date('2025-12-20T11:00:00Z'),
  },
  {
    patient_email: 'marcos.lima@gmail.com',
    dentista_email: 'ana.dentista@example.com',
    descricao: 'Clareamento dental',
    valor_total: 800.00,
    data_inicio: new Date('2025-12-21T15:00:00Z'),
  },
  {
    patient_email: 'ana.costa@gmail.com',
    dentista_email: 'rafael.dentista@example.com',
    descricao: 'Tratamento de canal',
    valor_total: 500.00,
    data_inicio: new Date('2025-12-22T09:30:00Z'),
  },
  {
    patient_email: 'rafael.pereira@outlook.com',
    dentista_email: 'carlos.dentista@example.com',
    descricao: 'Instalação de aparelho ortodôntico',
    valor_total: 1200.00,
    data_inicio: new Date('2025-12-23T16:00:00Z'),
  },
  {
    patient_email: 'patricia.nogueira@gmail.com',
    dentista_email: 'ana.dentista@example.com',
    descricao: 'Manutenção ortodôntica',
    valor_total: 180.00,
    data_inicio: new Date('2025-12-24T10:00:00Z'),
  },
  {
    patient_email: 'lucas.almeida@gmail.com',
    dentista_email: 'rafael.dentista@example.com',
    descricao: 'Implante dentário',
    valor_total: 2500.00,
    data_inicio: new Date('2025-12-26T13:30:00Z'),
  },
  {
    patient_email: 'camila.rocha@hotmail.com',
    dentista_email: 'carlos.dentista@example.com',
    descricao: 'Revisão e acompanhamento',
    valor_total: 120.00,
    data_inicio: new Date('2025-12-27T09:00:00Z'),
  },
];

// ================================
// PAGAMENTOS
// ================================
// Nota: treatment_index refere-se ao índice do tratamento no array acima
export const payments = [
  {
    treatment_index: 0, // Avaliação inicial
    valor_pago: 150.00,
    forma_pagamento: PaymentMethod.PIX,
    observacao: 'Pagamento integral via PIX',
  },
  {
    treatment_index: 1, // Limpeza e profilaxia
    valor_pago: 100.00,
    forma_pagamento: PaymentMethod.cartao_credito,
    observacao: 'Entrada no cartão de crédito',
  },
  {
    treatment_index: 2, // Restauração simples
    valor_pago: 250.00,
    forma_pagamento: PaymentMethod.cartao_debito,
    observacao: 'Pagamento à vista no débito',
  },
  {
    treatment_index: 3, // Extração dentária
    valor_pago: 100.00,
    forma_pagamento: PaymentMethod.dinheiro,
    observacao: 'Pagamento em espécie',
  },
  {
    treatment_index: 4, // Clareamento dental
    valor_pago: 300.00,
    forma_pagamento: PaymentMethod.PIX,
    observacao: 'Pagamento parcial',
  },
  {
    treatment_index: 5, // Tratamento de canal
    valor_pago: 500.00,
    forma_pagamento: PaymentMethod.boleto,
    observacao: 'Pagamento via boleto bancário',
  },
  {
    treatment_index: 6, // Instalação de aparelho
    valor_pago: 200.00,
    forma_pagamento: PaymentMethod.transferencia,
    observacao: 'Transferência bancária',
  },
  {
    treatment_index: 7, // Manutenção ortodôntica
    valor_pago: 180.00,
    forma_pagamento: PaymentMethod.cartao_credito,
    observacao: 'Pagamento parcelado no crédito',
  },
  {
    treatment_index: 9, // Revisão e acompanhamento
    valor_pago: 120.00,
    forma_pagamento: PaymentMethod.dinheiro,
    observacao: 'Pagamento na recepção',
  },
  {
    treatment_index: 8, // Implante dentário
    valor_pago: 250.00,
    forma_pagamento: PaymentMethod.PIX,
    observacao: 'Pagamento inicial',
  },
];
