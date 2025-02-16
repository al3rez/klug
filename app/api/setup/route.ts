import { NextResponse } from 'next/server';
import { createTables } from '@/lib/db/schema';

export async function POST() {
    try {
        await createTables();
        return NextResponse.json({ message: 'Database setup complete' });
    } catch (error) {
        console.error('Setup error:', error);
        return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
    }
} 