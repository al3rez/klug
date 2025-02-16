"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

type Message = {
    role: "user" | "assistant"
    content: string
}

type ChatInterfaceProps = {
    systemPrompt: string
    agentName: string
    model: string
}

export function ChatInterface({ systemPrompt, agentName, model }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage = { role: "user" as const, content: input }
        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: input,
                    systemPrompt: systemPrompt,
                    model: model,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to generate response')
            }

            const data = await response.json()
            setMessages(prev => [...prev, { role: "assistant", content: data.text }])
        } catch (error) {
            console.error("Error generating response:", error)
            toast({
                title: "Error",
                description: "Failed to generate response. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-[calc(100dvh-64px)]">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">{agentName}</h2>
                <p className="text-sm text-muted-foreground">{systemPrompt}</p>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((message, i) => (
                        <Card key={i} className={`p-3 ${message.role === "assistant" ? "bg-muted" : ""}`}>
                            <p className="text-sm">{message.content}</p>
                        </Card>
                    ))}
                </div>
            </ScrollArea>

            <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    )
} 