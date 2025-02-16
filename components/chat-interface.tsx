"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Pencil } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Message = {
    role: "user" | "assistant"
    content: string
}

type ChatInterfaceProps = {
    systemPrompt: string
    agentName: string
    model: string
    onEdit: (systemPrompt: string, model: string) => void
}

export function ChatInterface({ systemPrompt, agentName, model, onEdit }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editedPrompt, setEditedPrompt] = useState(systemPrompt)
    const [editedModel, setEditedModel] = useState(model)

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!editedPrompt.trim()) {
            toast({
                title: "Error",
                description: "Please enter a system prompt",
                variant: "destructive",
            })
            return
        }
        onEdit(editedPrompt, editedModel)
        setIsEditing(false)
    }

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
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">{agentName}</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setEditedPrompt(systemPrompt)
                            setEditedModel(model)
                            setIsEditing(true)
                        }}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">{systemPrompt}</p>
            </div>

            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit AI Agent</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="model">Model</Label>
                            <Select
                                value={editedModel}
                                onValueChange={setEditedModel}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select model" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</SelectItem>
                                    <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editSystemPrompt">System Prompt</Label>
                            <Textarea
                                id="editSystemPrompt"
                                placeholder="Enter system prompt"
                                value={editedPrompt}
                                onChange={(e) => setEditedPrompt(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Update AI Agent
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

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