// ================================
// EasyCore - Seed do Banco de Dados
// ================================

import { PrismaClient, TreatmentStatus, Role, PaymentMethod, PlanStatus, InstallmentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { users } from './seed-data';
import { encrypt } from '../src/lib/crypto';
import { updateTreatmentRisk } from '../src/lib/risk';
import { updateTreatmentTotalPaid } from '../src/lib/payments';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed robusto do banco de dados...\n');

  // 1. LIMPEZA DE DADOS (Opcional, mas útil para testes)
  console.log('🧹 Limpando dados antigos...');
  await prisma.payment.deleteMany();
  await prisma.installment.deleteMany();
  await prisma.paymentPlan.deleteMany();
  await prisma.treatmentSession.deleteMany();
  await prisma.treatment.deleteMany();
  await prisma.patient.deleteMany();
  // Não deletamos usuários para evitar quebrar o login do admin atual, 
  // mas vamos dar upsert neles.

  // 2. USUÁRIOS
  console.log('👥 Criando usuários...');
  const createdUsers: Record<string, any> = {};
  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.senha, 12);
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: { role: userData.role },
      create: {
        nome: userData.nome,
        email: userData.email,
        senha_hash: hashedPassword,
        role: userData.role,
      },
    });
    createdUsers[userData.email] = user;
    console.log(`   - Usuário: ${userData.email} (${userData.role})`);
  }
  
  const admin = createdUsers['admin@easycore.com'] || createdUsers['admin@example.com'];
  const dentista = createdUsers['carlos.dentista@example.com'];

  // 3. PACIENTES E TRATAMENTOS HISTÓRICOS (5 MESES)
  console.log('\n🏥 Gerando histórico de 5 meses...');
  const treatmentDescriptions = [
    'Canal Molar Superior', 'Limpeza Profunda', 'Implante Dentário', 
    'Aparelho Ortodôntico', 'Restauração de Resina', 'Extração de Siso',
    'Clareamento a Laser', 'Prótese Fixa', 'Gengivoplastia',
    'Tratamento de Canal', 'Coroa Porcelana', 'Raspagem Periodontal'
  ];

  const paymentMethods: PaymentMethod[] = ['PIX', 'cartao_credito', 'cartao_debito', 'dinheiro', 'boleto'];

  for (let i = 4; i >= 0; i--) {
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() - i);
    monthDate.setHours(10, 0, 0, 0); // Normalizar hora
    
    const monthName = monthDate.toLocaleString('pt-BR', { month: 'long' });
    console.log(`  📅 [Mês -${i}] ${monthName}`);

    // Criar 8-12 pacientes por mês para ter mais dados
    const patientCount = Math.floor(Math.random() * 5) + 8;
    for (let p = 0; p < patientCount; p++) {
      const pIdx = i * 100 + p;
      const email = `paciente${pIdx}_${i}@example.com`;
      const cpfRaw = `000000000${pIdx}`.slice(-11);
      const cpf = encrypt(cpfRaw);

      // Data de criação aleatória dentro do mês
      const patientDate = new Date(monthDate);
      patientDate.setDate(Math.floor(Math.random() * 28) + 1);

      const patient = await prisma.patient.create({
        data: {
          nome: `Paciente ${monthName} ${p+1}`,
          email,
          cpf_encrypted: cpf,
          telefone: `119${Math.floor(10000000 + Math.random() * 90000000)}`,
          created_at: patientDate,
          data_cadastro: patientDate,
        }
      });

      // 1-2 tratamentos por paciente
      const treatmentCount = Math.random() > 0.6 ? 2 : 1;
      for (let t = 0; t < treatmentCount; t++) {
        const descricao = treatmentDescriptions[Math.floor(Math.random() * treatmentDescriptions.length)];
        const valorTotal = Math.floor(Math.random() * 5000) + 500; // R$ 500 a R$ 5500
        
        const treatmentDate = new Date(patientDate);
        treatmentDate.setDate(treatmentDate.getDate() + t * 7);

        const treatment = await prisma.treatment.create({
          data: {
            patient_id: patient.id,
            dentista_id: dentista.id,
            descricao,
            valor_total: valorTotal,
            valor_pago_total: 0,
            status: 'aberto',
            created_at: treatmentDate,
            data_inicio: treatmentDate,
          }
        });

        // Criar Plano de Pagamento (variando entre 4, 6, 8, 10, 12, 18, 24 parcelas)
        const totalParcelas = [4, 6, 8, 10, 12, 18, 24][Math.floor(Math.random() * 7)];
        const valorParcela = valorTotal / totalParcelas;
        
        const plan = await prisma.paymentPlan.create({
          data: {
            treatment_id: treatment.id,
            total_parcelas: totalParcelas,
            valor_parcela: valorParcela,
            data_inicio: treatmentDate,
            dia_vencimento: [5, 10, 15, 20, 25][Math.floor(Math.random() * 5)],
            status: 'ativo'
          }
        });

        // Gerar parcelas e simular pagamentos com diferentes cenários
        const hasProblema = Math.random() < 0.25; // 25% dos pacientes têm problemas de pagamento
        
        for (let n = 1; n <= totalParcelas; n++) {
          const vencimento = new Date(treatmentDate);
          vencimento.setMonth(vencimento.getMonth() + (n - 1));
          vencimento.setDate(plan.dia_vencimento);

          const isOverdue = vencimento < new Date();
          let status: InstallmentStatus = 'em_aberto';
          let isCalote = false;
          let valorPagoParcela = 0;
          let dataPagamento: Date | null = null;

          if (isOverdue) {
            if (hasProblema) {
              // Paciente com problema - maior chance de inadimplência
              const random = Math.random();
              if (random > 0.5) { 
                // 50% pago
                status = 'paga';
                valorPagoParcela = valorParcela;
                // Pagamento com atraso de 1-10 dias
                dataPagamento = new Date(vencimento);
                dataPagamento.setDate(dataPagamento.getDate() + Math.floor(Math.random() * 10));
              } else if (random > 0.2) { 
                // 30% atrasada
                status = 'atrasada';
              } else { 
                // 20% calote
                status = 'atrasada';
                isCalote = true;
              }
            } else {
              // Paciente bom - maior chance de pagar
              const random = Math.random();
              if (random > 0.15) { 
                // 85% pago
                status = 'paga';
                valorPagoParcela = valorParcela;
                // Pagamento em dia ou com leve atraso
                dataPagamento = new Date(vencimento);
                if (Math.random() > 0.7) {
                  dataPagamento.setDate(dataPagamento.getDate() + Math.floor(Math.random() * 3));
                }
              } else { 
                // 15% atrasada
                status = 'atrasada';
              }
            }
          }

          const installment = await prisma.installment.create({
            data: {
              payment_plan_id: plan.id,
              numero_parcela: n,
              valor_esperado: valorParcela,
              valor_pago: valorPagoParcela,
              data_vencimento: vencimento,
              status,
              is_calote: isCalote,
              data_pagamento: dataPagamento
            }
          });

          if (valorPagoParcela > 0) {
            const formaPagamento = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
            await prisma.payment.create({
              data: {
                treatment_id: treatment.id,
                installment_id: installment.id,
                valor_pago: valorPagoParcela,
                forma_pagamento: formaPagamento,
                recebido_por_id: admin.id,
                data: dataPagamento!
              }
            });
          }
        }

        // Sincronizar totais e risco
        await updateTreatmentTotalPaid(treatment.id);
        await updateTreatmentRisk(treatment.id);
      }
    }
    console.log(`     ✅ ${patientCount} pacientes e tratamentos criados.`);
  }

  console.log('\n🎉 Seed histórico concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
