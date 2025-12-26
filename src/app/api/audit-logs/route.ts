// ================================
// GET /api/audit-logs
// Lista logs de auditoria (Admin only)
// ================================

import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verificar se é admin (injetado pelo middleware)
    const userRole = request.headers.get('x-user-role');
    
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem visualizar logs de auditoria.' },
        { status: 403 }
      );
    }

    // Parâmetros de filtro
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || undefined;
    const acao = searchParams.get('acao') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Filtro de data
    const days = parseInt(searchParams.get('days') || '30'); // Número de dias para trás
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam 
      ? new Date(startDateParam) 
      : new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Buscar logs
    const result = await getAuditLogs({
      userId,
      acao,
      startDate,
      endDate,
      page,
      limit,
    });

    // Formatar resposta
    const formattedLogs = result.logs.map(log => ({
      id: log.id,
      acao: log.acao,
      detalhes: log.detalhes ? JSON.stringify(log.detalhes) : null,
      timestamp: log.timestamp.toISOString(),
      user: {
        id: log.user.id,
        nome: log.user.nome,
        email: log.user.email,
        role: log.user.role,
      },
    }));

    return NextResponse.json({
      logs: formattedLogs,
      pagination: result.pagination,
    });

  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
