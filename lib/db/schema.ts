import { sql } from '@vercel/postgres';

export async function createTables() {
  try {
    // Create folders table with index
    await sql`
      CREATE TABLE IF NOT EXISTS folders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_folders_created_at ON folders(created_at DESC);
    `;

    // Create ai_agents table with indexes
    await sql`
      CREATE TABLE IF NOT EXISTS ai_agents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        system_prompt TEXT,
        model VARCHAR(50) NOT NULL,
        folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_ai_agents_created_at ON ai_agents(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_ai_agents_folder_id ON ai_agents(folder_id);
    `;

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
} 