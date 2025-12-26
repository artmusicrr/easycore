// ================================
// EasyCore - Seed do Banco de Dados
// ================================

import { PrismaClient, TreatmentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { users, patients, treatments, payments } from './seed-data';
import { encrypt } from '../src/lib/crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // ================================
  // 1. CRIAR USUÁRIOS
  // ================================
  console.log('👥 Criando usuários...');
  const createdUsers: Record<string, any> = {};
  
  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.senha, 12);
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        nome: userData.nome,
        email: userData.email,
        senha_hash: hashedPassword,
        role: userData.role,
        two_factor_enabled: false,
      },
    });
    createdUsers[userData.email] = user;
    console.log(`  ✅ ${user.nome} (${user.role})`);
  }
  console.log(`\n📊 Total de usuários criados: ${Object.keys(createdUsers).length}\n`);

  // ================================
  // 2. CRIAR PACIENTES
  // ================================
  console.log('🏥 Criando pacientes...');
  const createdPatients: Record<string, any> = {};
  
  for (const patientData of patients) {
    // Criptografar CPF
    const cpfEncrypted = encrypt(patientData.cpf.replace(/\D/g, ''));
    
    const patient = await prisma.patient.upsert({
      where: { cpf_encrypted: cpfEncrypted },
      update: {},
      create: {
        nome: patientData.nome,
        telefone: patientData.telefone,
        cpf_encrypted: cpfEncrypted,
        email: patientData.email,
        consentimento_lgpd: patientData.consentimento_lgpd,
      },
    });
    createdPatients[patientData.email] = patient;
    console.log(`  ✅ ${patient.nome}`);
  }
  console.log(`\n📊 Total de pacientes criados: ${Object.keys(createdPatients).length}\n`);

  // ================================
  // 3. CRIAR TRATAMENTOS
  // ================================
  console.log('🦷 Criando tratamentos...');
  const createdTreatments: any[] = [];
  
  for (const treatmentData of treatments) {
    const patient = createdPatients[treatmentData.patient_email];
    const dentista = createdUsers[treatmentData.dentista_email];
    
    if (!patient || !dentista) {
      console.warn(`  ⚠️  Pulando tratamento: paciente ou dentista não encontrado`);
      continue;
    }

    const treatment = await prisma.treatment.create({
      data: {
        patient_id: patient.id,
        dentista_id: dentista.id,
        descricao: treatmentData.descricao,
        valor_total: treatmentData.valor_total,
        valor_pago_total: 0,
        data_inicio: treatmentData.data_inicio,
        status: TreatmentStatus.aberto,
        risco_inadimplencia: 0.5, // Será recalculado após os pagamentos
      },
    });
    createdTreatments.push(treatment);
    console.log(`  ✅ ${treatment.descricao} - R$ ${treatment.valor_total}`);
  }
  console.log(`\n📊 Total de tratamentos criados: ${createdTreatments.length}\n`);

  // ================================
  // 4. CRIAR PAGAMENTOS
  // ================================
  console.log('💰 Criando pagamentos...');
  const admin = createdUsers['admin@easycore.com'];
  let totalPagamentos = 0;
  
  for (const paymentData of payments) {
    const treatment = createdTreatments[paymentData.treatment_index];
    
    if (!treatment) {
      console.warn(`  ⚠️  Pulando pagamento: tratamento não encontrado`);
      continue;
    }

    const payment = await prisma.payment.create({
      data: {
        treatment_id: treatment.id,
        valor_pago: paymentData.valor_pago,
        forma_pagamento: paymentData.forma_pagamento,
        recebido_por_id: admin.id,
        observacao: paymentData.observacao,
      },
    });

    // Atualizar valor pago total no tratamento
    await prisma.treatment.update({
      where: { id: treatment.id },
      data: {
        valor_pago_total: {
          increment: paymentData.valor_pago,
        },
      },
    });

    totalPagamentos += paymentData.valor_pago;
    console.log(`  ✅ ${paymentData.forma_pagamento} - R$ ${payment.valor_pago}`);
  }
  console.log(`\n📊 Total arrecadado: R$ ${totalPagamentos.toFixed(2)}\n`);

  // ================================
  // 5. CRIAR LOG DE AUDITORIA
  // ================================
  await prisma.auditLog.create({
    data: {
      user_id: admin.id,
      acao: 'SEED_EXECUTED',
      detalhes: {
        message: 'Seed completo executado com sucesso',
        timestamp: new Date().toISOString(),
        stats: {
          users: Object.keys(createdUsers).length,
          patients: Object.keys(createdPatients).length,
          treatments: createdTreatments.length,
          payments: payments.length,
          total_arrecadado: totalPagamentos,
        },
      },
    },
  });
  console.log('✅ Log de auditoria criado');

  console.log('\n🎉 Seed concluído com sucesso!\n');
  console.log('📋 Resumo:');
  console.log(`   - Usuários: ${Object.keys(createdUsers).length}`);
  console.log(`   - Pacientes: ${Object.keys(createdPatients).length}`);
  console.log(`   - Tratamentos: ${createdTreatments.length}`);
  console.log(`   - Pagamentos: ${payments.length}`);
  console.log(`   - Total arrecadado: R$ ${totalPagamentos.toFixed(2)}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
