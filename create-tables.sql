-- ================================
-- EasyCore Database Schema
-- Schema: easy
-- ================================

CREATE SCHEMA IF NOT EXISTS easy;

-- ================================
-- Users Table
-- ================================
CREATE TABLE IF NOT EXISTS easy.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'recepcao',
  two_factor_secret VARCHAR(255),
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- Patients Table
-- ================================
CREATE TABLE IF NOT EXISTS easy.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  cpf_encrypted VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  consentimento_lgpd BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- Treatments Table
-- ================================
CREATE TABLE IF NOT EXISTS easy.treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES easy.patients(id) ON DELETE CASCADE,
  dentista_id UUID NOT NULL REFERENCES easy.users(id),
  descricao TEXT NOT NULL,
  valor_total DECIMAL(10, 2) NOT NULL,
  valor_pago_total DECIMAL(10, 2) DEFAULT 0,
  data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_fim TIMESTAMP,
  status VARCHAR(50) DEFAULT 'aberto',
  risco_inadimplencia FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- Payments Table
-- ================================
CREATE TABLE IF NOT EXISTS easy.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_id UUID NOT NULL REFERENCES easy.treatments(id) ON DELETE CASCADE,
  valor_pago DECIMAL(10, 2) NOT NULL,
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  forma_pagamento VARCHAR(50) NOT NULL,
  recebido_por_id UUID NOT NULL REFERENCES easy.users(id),
  comprovante_url VARCHAR(255),
  observacao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- Treatment Sessions Table
-- ================================
CREATE TABLE IF NOT EXISTS easy.treatment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_id UUID NOT NULL REFERENCES easy.treatments(id) ON DELETE CASCADE,
  data_sessao TIMESTAMP NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- Audit Logs Table
-- ================================
CREATE TABLE IF NOT EXISTS easy.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES easy.users(id),
  acao VARCHAR(255) NOT NULL,
  tabela VARCHAR(100) NOT NULL,
  registro_id UUID,
  dados_anteriores JSONB,
  dados_novos JSONB,
  data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- Create Indexes
-- ================================
CREATE INDEX IF NOT EXISTS idx_treatments_patient_id ON easy.treatments(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatments_dentista_id ON easy.treatments(dentista_id);
CREATE INDEX IF NOT EXISTS idx_payments_treatment_id ON easy.payments(treatment_id);
CREATE INDEX IF NOT EXISTS idx_sessions_treatment_id ON easy.treatment_sessions(treatment_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON easy.audit_logs(user_id);
