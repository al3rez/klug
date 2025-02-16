import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function PUT(req: Request) {
    try {
        const { id, name } = await req.json();

        const { rows } = await sql`
      UPDATE folders
      SET name = ${name}
      WHERE id = ${id}
      RETURNING *;
    `;

        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error('Error updating folder:', error);
        return NextResponse.json(
            { error: 'Failed to update folder' },
            { status: 500 }
        );
    }
} 