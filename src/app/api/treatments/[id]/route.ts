// ================================
// GET /api/treatments/[id]
// Buscar tratamento por ID
// ================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTreatmentBalance } from "@/lib/payments";
import { getRiskLevel } from "@/lib/risk";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Buscar tratamento
    const treatment = await prisma.treatment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            nome: true,
            telefone: true,
            email: true,
            consentimento_lgpd: true,
          },
        },
        dentista: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        payments: {
          orderBy: { data: "desc" },
          select: {
            id: true,
            treatment_id: true,
            valor_pago: true,
            data: true,
            forma_pagamento: true,
            comprovante_url: true,
            observacao: true,
            recebido_por_id: true,
            created_at: true,
          },
        },
        sessions: {
          orderBy: { data: "asc" },
        },
      },
    });

    if (!treatment) {
      return NextResponse.json(
        { error: "Tratamento não encontrado" },
        { status: 404 }
      );
    }

    // Verificar acesso (dentistas só veem seus próprios tratamentos)
    if (userRole === "dentista" && treatment.dentista_id !== userId) {
      return NextResponse.json(
        { error: "Acesso negado a este tratamento" },
        { status: 403 }
      );
    }

    // Calcular informações financeiras
    const balance = await getTreatmentBalance(id);

    // Obter nível de risco
    const riskLevel = treatment.risco_inadimplencia
      ? getRiskLevel(treatment.risco_inadimplencia)
      : "medio";

    return NextResponse.json({
      treatment: {
        ...treatment,
        financeiro: balance,
        risco: {
          score: treatment.risco_inadimplencia,
          nivel: riskLevel,
        },
      },
    });
  } catch (error) {
    console.error("Erro ao buscar tratamento:", error);

    const errorProtocol = Math.floor(10000 + Math.random() * 90000);

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        protocol: errorProtocol,
      },
      { status: 500 }
    );
  }
}

// PUT /api/treatments/[id] - Atualizar tratamento
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    // Verificar se tratamento existe
    const existingTreatment = await prisma.treatment.findUnique({
      where: { id },
    });

    if (!existingTreatment) {
      return NextResponse.json(
        { error: "Tratamento não encontrado" },
        { status: 404 }
      );
    }

    // Verificar acesso
    if (userRole === "dentista" && existingTreatment.dentista_id !== userId) {
      return NextResponse.json(
        { error: "Acesso negado a este tratamento" },
        { status: 403 }
      );
    }

    // Campos permitidos para atualização
    const allowedFields = ["descricao", "valor_total", "status", "data_fim"];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "data_fim" && body[field]) {
          updateData[field] = new Date(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const updatedTreatment = await prisma.treatment.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            nome: true,
          },
        },
        dentista: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Tratamento atualizado com sucesso",
      treatment: updatedTreatment,
    });
  } catch (error) {
    console.error("Erro ao atualizar tratamento:", error);

    const errorProtocol = Math.floor(10000 + Math.random() * 90000);

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        protocol: errorProtocol,
      },
      { status: 500 }
    );
  }
}
