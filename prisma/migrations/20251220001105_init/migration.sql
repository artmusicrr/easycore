-- CreateEnum
CREATE TYPE "easy"."Role" AS ENUM ('recepcao', 'dentista', 'admin');

-- CreateEnum
CREATE TYPE "easy"."TreatmentStatus" AS ENUM ('aberto', 'pago', 'atrasado');

-- CreateEnum
CREATE TYPE "easy"."PaymentMethod" AS ENUM ('PIX', 'cartao_credito', 'cartao_debito', 'dinheiro', 'boleto', 'transferencia');

-- CreateEnum
CREATE TYPE "easy"."SessionStatus" AS ENUM ('agendada', 'realizada', 'cancelada');

-- CreateTable
CREATE TABLE "easy"."users" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "role" "easy"."Role" NOT NULL DEFAULT 'recepcao',
    "two_factor_secret" TEXT,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "easy"."patients" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "cpf_encrypted" TEXT NOT NULL,
    "email" TEXT,
    "data_cadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consentimento_lgpd" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "easy"."treatments" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "dentista_id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor_total" DECIMAL(10,2) NOT NULL,
    "valor_pago_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "data_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_fim" TIMESTAMP(3),
    "status" "easy"."TreatmentStatus" NOT NULL DEFAULT 'aberto',
    "risco_inadimplencia" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treatments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "easy"."payments" (
    "id" TEXT NOT NULL,
    "treatment_id" TEXT NOT NULL,
    "valor_pago" DECIMAL(10,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "forma_pagamento" "easy"."PaymentMethod" NOT NULL,
    "recebido_por_id" TEXT NOT NULL,
    "comprovante_url" TEXT,
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "easy"."treatment_sessions" (
    "id" TEXT NOT NULL,
    "treatment_id" TEXT NOT NULL,
    "nome_sessao" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "status" "easy"."SessionStatus" NOT NULL DEFAULT 'agendada',
    "valor_sessao" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treatment_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "easy"."audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detalhes" JSONB,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "easy"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patients_cpf_encrypted_key" ON "easy"."patients"("cpf_encrypted");

-- CreateIndex
CREATE UNIQUE INDEX "patients_email_key" ON "easy"."patients"("email");

-- AddForeignKey
ALTER TABLE "easy"."treatments" ADD CONSTRAINT "treatments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "easy"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "easy"."treatments" ADD CONSTRAINT "treatments_dentista_id_fkey" FOREIGN KEY ("dentista_id") REFERENCES "easy"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "easy"."payments" ADD CONSTRAINT "payments_treatment_id_fkey" FOREIGN KEY ("treatment_id") REFERENCES "easy"."treatments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "easy"."payments" ADD CONSTRAINT "payments_recebido_por_id_fkey" FOREIGN KEY ("recebido_por_id") REFERENCES "easy"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "easy"."treatment_sessions" ADD CONSTRAINT "treatment_sessions_treatment_id_fkey" FOREIGN KEY ("treatment_id") REFERENCES "easy"."treatments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "easy"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "easy"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
