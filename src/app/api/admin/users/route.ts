// ================================
// GET /api/admin/users
// Listar todos os usuários (Apenas Admin)
// ================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // O middleware já verificou se o usuário é admin
        const users = await prisma.user.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                role: true,
                created_at: true,
            },
            orderBy: {
                nome: 'asc',
            },
        });

        return NextResponse.json({ users });

    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
