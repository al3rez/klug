import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function PUT(req: Request) {
    try {
        const { agentId, folderId } = await req.json();

        const { rows } = await sql`
      UPDATE ai_agents
      SET folder_id = ${folderId}
      WHERE id = ${agentId}
      RETURNING *;
    `;

        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error('Error moving AI agent:', error);
        return NextResponse.json(
            { error: 'Failed to move AI agent' },
            { status: 500 }
        );
    }
} 