import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { prompt: userPrompt, systemPrompt, model } = await req.json()

        console.log(userPrompt, systemPrompt, model)
        const { text } = await generateText({
            model: anthropic(model),
            system: systemPrompt,
            prompt: userPrompt,
            maxTokens: 1000,
        })

        return NextResponse.json({ text })
    } catch (error) {
        console.error('Chat API error:', error)
        return NextResponse.json(
            { error: 'Failed to generate response' },
            { status: 500 }
        )
    }
} 