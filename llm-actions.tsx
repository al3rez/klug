"use client"

import type React from "react"

import { useState } from "react"
import { ChevronLeft, Plus, Folder, Share2, Bot, Star, BrainCog, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { LibrarySquare } from "lucide-react"
import { ChatInterface } from "@/components/chat-interface"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"

type Item = {
  id: number
  name: string
  type: "folder" | "ai"
  systemPrompt?: string
  model?: "claude-3-5-haiku-20241022" | "claude-3-5-sonnet-20241022"
}

export default function LLMActions() {
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: "Folder1", type: "folder" },
    { id: 2, name: "Folder2", type: "folder" },
    {
      id: 3,
      name: "My Assistant",
      type: "ai",
      systemPrompt: "You are a helpful AI assistant.",
      model: "claude-3-5-sonnet-20241022"
    },
  ])

  const [newFolderName, setNewFolderName] = useState("")
  const [newAIName, setNewAIName] = useState("")
  const [newAIPrompt, setNewAIPrompt] = useState("")
  const [newAIModel, setNewAIModel] = useState<string>("")
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false)
  const [isNewAIOpen, setIsNewAIOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [editedPrompt, setEditedPrompt] = useState("")
  const [editedModel, setEditedModel] = useState<string>("")

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a folder name",
        variant: "destructive",
      })
      return
    }

    const newFolder = {
      id: items.length + 1,
      name: newFolderName,
      type: "folder" as const,
    }
    setItems([...items, newFolder])
    setNewFolderName("")
    setIsNewFolderOpen(false)
    toast({
      title: "Success",
      description: "Folder created successfully",
    })
  }

  const handleCreateAI = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAIName.trim() || !newAIPrompt.trim() || !newAIModel) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const newAI = {
      id: items.length + 1,
      name: newAIName,
      type: "ai" as const,
      systemPrompt: newAIPrompt,
      model: newAIModel as Item['model'],
    }
    setItems([...items, newAI])
    setNewAIName("")
    setNewAIPrompt("")
    setNewAIModel("")
    setIsNewAIOpen(false)
    toast({
      title: "Success",
      description: "AI agent created successfully",
    })
  }

  const handleEditAI = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editedPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a system prompt",
        variant: "destructive",
      })
      return
    }

    setItems(items.map(item =>
      item.id === editingItem?.id
        ? { ...item, systemPrompt: editedPrompt, model: editedModel as Item['model'] }
        : item
    ))
    setEditingItem(null)
    setEditedPrompt("")
    setEditedModel("")
    toast({
      title: "Success",
      description: "AI agent updated successfully",
    })
  }

  if (selectedItem && selectedItem.type === "ai") {
    return (
      <div className="h-screen">
        <div className="p-4 border-b">
          <Button
            variant="ghost"
            onClick={() => setSelectedItem(null)}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <ChatInterface
          systemPrompt={selectedItem.systemPrompt || ""}
          agentName={selectedItem.name}
          model={selectedItem.model || "claude-3-5-sonnet-20241022"}
        />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-background min-h-[100dvh]">
      {/* Header */}
      <div className="p-4 border-b sticky top-0 bg-background z-10">
        <div className="flex items-center gap-4 justify-between">
          <h1 className="text-lg font-medium flex items-center gap-1 font-bold tracking-tight leading-tight">
            <LibrarySquare className="h-5 w-5" />
            Klug
          </h1>
          <ThemeToggle />
        </div>
        <div className="flex gap-2 mt-4">
          <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 text-sm">
                Create new folder
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateFolder} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="folderName">Folder Name</Label>
                  <Input
                    id="folderName"
                    placeholder="Enter folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Folder
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isNewAIOpen} onOpenChange={setIsNewAIOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 text-sm">
                Create new AI
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New AI Agent</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAI} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="aiName">AI Name</Label>
                  <Input
                    id="aiName"
                    placeholder="Enter AI name"
                    value={newAIName}
                    onChange={(e) => setNewAIName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value={newAIModel}
                    onValueChange={setNewAIModel}
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
                  <Label htmlFor="systemPrompt">System Prompt</Label>
                  <Textarea
                    id="systemPrompt"
                    placeholder="Enter system prompt"
                    value={newAIPrompt}
                    onChange={(e) => setNewAIPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create AI Agent
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit AI Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit AI Agent</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditAI} className="space-y-4 mt-4">
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

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 p-3">
        {items.map((item) => (
          <Card
            key={item.id}
            className="flex flex-col items-center justify-center aspect-square hover:bg-accent cursor-pointer transition-colors p-3 relative"
            onClick={() => setSelectedItem(item)}
          >
            {item.type === "folder" ? (
              <Folder className="h-8 w-8 mb-2 text-muted-foreground" />
            ) : (
              <>
                <Bot className="h-8 w-8 mb-2 text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingItem(item)
                    setEditedPrompt(item.systemPrompt || "")
                    setEditedModel(item.model || "claude-3-5-sonnet-20241022")
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </>
            )}
            <span className="text-sm text-center font-medium">{item.name}</span>
            {item.type === "ai" && (
              <>
                <span className="text-xs text-muted-foreground mt-1 text-center line-clamp-2">
                  {item.systemPrompt}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {item.model?.includes("haiku") ? "Haiku" : "Sonnet"}
                </span>
              </>
            )}
          </Card>
        ))}
        <Card
          className="flex flex-col items-center justify-center aspect-square hover:bg-accent cursor-pointer transition-colors p-3"
          onClick={() => setIsNewFolderOpen(true)}
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

