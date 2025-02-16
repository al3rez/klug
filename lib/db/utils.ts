import { sql } from '@vercel/postgres';

export type Folder = {
    id: number;
    name: string;
    created_at: Date;
};

export type AIAgent = {
    id: number;
    name: string;
    system_prompt: string;
    model: string;
    folder_id: number | null;
    created_at: Date;
};

export async function getFolders() {
    const { rows } = await sql<Folder>`
    SELECT * FROM folders ORDER BY created_at DESC;
  `;
    return rows;
}

export async function createFolder(name: string) {
    const { rows } = await sql<Folder>`
    INSERT INTO folders (name)
    VALUES (${name})
    RETURNING *;
  `;
    return rows[0];
}

export async function getAIAgents() {
    const { rows } = await sql<AIAgent>`
    SELECT * FROM ai_agents ORDER BY created_at DESC;
  `;
    return rows;
}

export async function createAIAgent(
    name: string,
    systemPrompt: string,
    model: string,
    folderId: number | null
) {
    const { rows } = await sql<AIAgent>`
    INSERT INTO ai_agents (name, system_prompt, model, folder_id)
    VALUES (${name}, ${systemPrompt}, ${model}, ${folderId})
    RETURNING *;
  `;
    return rows[0];
}

export async function updateAIAgent(
    id: number,
    systemPrompt: string,
    model: string
) {
    const { rows } = await sql<AIAgent>`
    UPDATE ai_agents
    SET system_prompt = ${systemPrompt}, model = ${model}
    WHERE id = ${id}
    RETURNING *;
  `;
    return rows[0];
} 