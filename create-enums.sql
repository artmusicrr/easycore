-- ================================
-- Create ENUM Types
-- ================================

CREATE TYPE easy."Role" AS ENUM ('recepcao', 'dentista', 'admin');
CREATE TYPE easy."TreatmentStatus" AS ENUM ('aberto', 'pago', 'atrasado');
