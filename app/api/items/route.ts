import { NextResponse } from 'next/server';
import { createFolder, createAIAgent, getFolders, getAIAgents, updateAIAgent } from '@/lib/db/utils';
import { checkAuth } from '@/lib/auth';

export async function GET() {
    try {
        checkAuth();
        const [folders, agents] = await Promise.all([getFolders(), getAIAgents()]);
        return NextResponse.json({ folders, agents });
    } catch (error) {
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        console.error('Error fetching items:', error);
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        checkAuth();
        const { type, name, systemPrompt, model, folderId } = await req.json();

        if (type === 'folder') {
            const folder = await createFolder(name);
            return NextResponse.json(folder);
        } else if (type === 'ai') {
            const agent = await createAIAgent(name, systemPrompt, model, folderId);
            return NextResponse.json(agent);
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (error) {
        console.error('Error creating item:', error);
        return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        checkAuth();
        const { id, systemPrompt, model } = await req.json();
        const agent = await updateAIAgent(id, systemPrompt, model);
        return NextResponse.json(agent);
    } catch (error) {
        console.error('Error updating agent:', error);
        return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
    }
} 