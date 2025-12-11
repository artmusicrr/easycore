// ================================
// EasyCore - Seed do Banco de Dados
// ================================

import { PrismaClient, Role, PaymentMethod, TreatmentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@easycore.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@easycore.com',
      senha_hash: adminPassword,
      role: Role.admin,
      two_factor_enabled: false,
    },
  });
  console.log(`✅ Usuário admin criado: ${admin.email}`);

  // Criar dentista
  const dentistaPassword = await bcrypt.hash('Dentista@123', 12);
  const dentista = await prisma.user.upsert({
    where: { email: 'dentista@easycore.com' },
    update: {},
    create: {
      nome: 'Dr. João Silva',
      email: 'dentista@easycore.com',
      senha_hash: dentistaPassword,
      role: Role.dentista,
    },
  });
  console.log(`✅ Usuário dentista criado: ${dentista.email}`);

  // Criar recepcionista
  const recepPassword = await bcrypt.hash('Recepcao@123', 12);
  const recepcao = await prisma.user.upsert({
    where: { email: 'recepcao@easycore.com' },
    update: {},
    create: {
      nome: 'Maria Santos',
      email: 'recepcao@easycore.com',
      senha_hash: recepPassword,
      role: Role.recepcao,
    },
  });
  console.log(`✅ Usuário recepção criado: ${recepcao.email}`);

  // Criar paciente de exemplo (CPF criptografado seria necessário em produção)
  const patient = await prisma.patient.upsert({
    where: { cpf_encrypted: 'ENCRYPTED_12345678901' },
    update: {},
    create: {
      nome: 'Carlos Oliveira',
      telefone: '(11) 99999-9999',
      cpf_encrypted: 'ENCRYPTED_12345678901', // Em produção, usar criptografia real
      email: 'paciente@email.com',
      consentimento_lgpd: true,
    },
  });
  console.log(`✅ Paciente criado: ${patient.nome}`);

  // Criar tratamento de exemplo
  const treatment = await prisma.treatment.upsert({
    where: { id: 'seed-treatment-001' },
    update: {},
    create: {
      id: 'seed-treatment-001',
      patient_id: patient.id,
      dentista_id: dentista.id,
      descricao: 'Tratamento ortodôntico completo',
      valor_total: 5000.00,
      valor_pago_total: 1000.00,
      status: TreatmentStatus.aberto,
      risco_inadimplencia: 0.15, // 15% de risco (simulado)
    },
  });
  console.log(`✅ Tratamento criado: ${treatment.descricao}`);

  // Criar pagamento de exemplo
  const payment = await prisma.payment.upsert({
    where: { id: 'seed-payment-001' },
    update: {},
    create: {
      id: 'seed-payment-001',
      treatment_id: treatment.id,
      valor_pago: 1000.00,
      forma_pagamento: PaymentMethod.PIX,
      recebido_por_id: recepcao.id,
      observacao: 'Entrada do tratamento',
    },
  });
  console.log(`✅ Pagamento criado: R$ ${payment.valor_pago}`);

  // Criar log de auditoria
  await prisma.auditLog.create({
    data: {
      user_id: admin.id,
      acao: 'SEED_EXECUTED',
      detalhes: {
        message: 'Seed inicial executado com sucesso',
        timestamp: new Date().toISOString(),
      },
    },
  });
  console.log('✅ Log de auditoria criado');

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
