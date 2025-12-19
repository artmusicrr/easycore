// ================================
// GET /api/patients/[id]
// Buscar paciente por ID
// ================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const { id } = params;
    
    console.log(`[API GET Patient] ID: ${id}, UserID: ${userId}`);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }
    
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        _count: {
          select: { treatments: true },
        },
      },
    });
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404, headers: corsHeaders }
      );
    }
    
    return NextResponse.json({ patient }, { headers: corsHeaders });
    
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    const body = await request.json();
    
    const patient = await prisma.patient.update({
      where: { id },
      data: body,
    });
    
    await createAuditLog({
      userId,
      acao: AUDIT_ACTIONS.PATIENT_UPDATED,
      detalhes: { patient_id: id },
    });
    
    return NextResponse.json({ 
      message: 'Paciente atualizado com sucesso',
      patient 
    }, { headers: corsHeaders });
    
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500, headers: corsHeaders }
    );
  }
}
