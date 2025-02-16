"use client"

import { ChevronLeft, Bot, Pencil, Plus, Share2, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import type { DBItem } from "@/types"

interface FolderViewProps {
    folder: DBItem
    agents: DBItem[]
    onBack: () => void
    onSelectAgent: (agent: DBItem) => void
    onEditAgent: (agent: DBItem) => void
    onNewAI: () => void
    onUpdateFolder: (id: number, name: string) => void
}

export function FolderView({ folder, agents, onBack, onSelectAgent, onEditAgent, onNewAI, onUpdateFolder }: FolderViewProps) {
    const [isEditingFolder, setIsEditingFolder] = useState(false)
    const [editedFolderName, setEditedFolderName] = useState(folder.name)

    const handleUpdateFolder = (e: React.FormEvent) => {
        e.preventDefault()
        if (!editedFolderName.trim()) {
            toast({
                title: "Error",
                description: "Please enter a folder name",
                variant: "destructive",
            })
            return
        }
        onUpdateFolder(folder.id, editedFolderName)
        setIsEditingFolder(false)
    }

    return (
        <div className="max-w-md mx-auto bg-background min-h-[100dvh]">
            {/* Header */}
            <div className="p-4 border-b sticky top-0 bg-background z-10">
                <div className="flex items-center gap-4 justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={onBack}
                            className="flex items-center gap-2 p-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <h1 className="text-lg font-medium flex items-center gap-2 font-bold tracking-tight leading-tight">
                                <Folder className="h-6 w-6" />
                                {folder.name}
                            </h1>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setEditedFolderName(folder.name)
                                setIsEditingFolder(true)
                            }}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </div>
                    <ThemeToggle />
                </div>
                <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1 text-sm" onClick={onNewAI}>
                        Create new AI
                    </Button>
                </div>
            </div>

            {/* Edit Folder Dialog */}
            <Dialog open={isEditingFolder} onOpenChange={setIsEditingFolder}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Folder Name</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateFolder} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="folderName">Folder Name</Label>
                            <Input
                                id="folderName"
                                placeholder="Enter folder name"
                                value={editedFolderName}
                                onChange={(e) => setEditedFolderName(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Update Folder
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-3 p-3">
                {agents.map((agent) => (
                    <Card
                        key={agent.id}
                        className="flex flex-col items-center justify-center aspect-square hover:bg-accent cursor-pointer transition-colors p-3 relative"
                        onClick={() => onSelectAgent(agent)}
                    >
                        <Bot className="h-8 w-8 mb-2 text-muted-foreground" />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={(e) => {
                                e.stopPropagation()
                                onEditAgent(agent)
                            }}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-center font-medium">{agent.name}</span>
                        <span className="text-xs text-muted-foreground mt-1">
                            {agent.model?.includes("haiku") ? "Haiku" : "Sonnet"}
                        </span>
                    </Card>
                ))}
                <Card
                    className="flex flex-col items-center justify-center aspect-square hover:bg-accent cursor-pointer transition-colors p-3"
                    onClick={onNewAI}
                >
                    <Plus className="h-8 w-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Add New</span>
                </Card>
            </div>

            {/* Share Button */}
            <div className="fixed bottom-6 right-6">
                <Button size="icon" className="rounded-full h-12 w-12 shadow-lg">
                    <Share2 className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
} 