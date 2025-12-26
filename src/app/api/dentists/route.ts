// ================================
// GET /api/dentists
// Listar dentistas cadastrados
// ================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
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

        return NextResponse.json({ dentists });

    } catch (error) {
        console.error('Erro ao listar dentistas:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
