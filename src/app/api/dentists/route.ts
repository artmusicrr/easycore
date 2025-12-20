// ================================
// GET /api/dentists
// Listar dentistas cadastrados
// ================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Headers CORS
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            );
        }

        const dentists = await prisma.user.findMany({
            where: {
                role: 'dentista',
            },
            select: {
                id: true,
                nome: true,
                email: true,
            },
            orderBy: {
                nome: 'asc',
            },
        });

        return NextResponse.json(
            { dentists },
            { headers: corsHeaders }
        );

    } catch (error) {
        console.error('Erro ao listar dentistas:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500, headers: corsHeaders }
        );
    }
}
