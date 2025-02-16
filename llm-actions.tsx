"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { FolderView } from "@/components/folder-view"

type DBItem = {
  id: number;
  name: string;
  type: "folder" | "ai";
  system_prompt?: string;
  model?: string;
  folder_id?: number | null;
  created_at: Date;
};

export default function LLMActions() {
  const queryClient = useQueryClient()
  const [newFolderName, setNewFolderName] = useState("")
  const [newAIName, setNewAIName] = useState("")
  const [newAIPrompt, setNewAIPrompt] = useState("")
  const [newAIModel, setNewAIModel] = useState<string>("")
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false)
  const [isNewAIOpen, setIsNewAIOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<DBItem | null>(null)
  const [editingItem, setEditingItem] = useState<DBItem | null>(null)
  const [editedPrompt, setEditedPrompt] = useState("")
  const [editedModel, setEditedModel] = useState<string>("")
  const [selectedFolder, setSelectedFolder] = useState<DBItem | null>(null)

  // Query for fetching items
  const { data: itemsList = [], isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const response = await fetch('/api/items')
      const data = await response.json()
      return [
        ...data.folders.map((f: any) => ({ ...f, type: 'folder' as const })),
        ...data.agents.map((a: any) => ({
          ...a,
          type: 'ai' as const,
          system_prompt: a.system_prompt,
        })),
      ]
    },
  })

  // Mutation for creating folder
  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'folder', name }),
      })
      if (!response.ok) throw new Error('Failed to create folder')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      setNewFolderName("")
      setIsNewFolderOpen(false)
      toast({
        title: "Success",
        description: "Folder created successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      })
    },
  })

  // Mutation for creating AI agent
  const createAIMutation = useMutation({
    mutationFn: async (data: { name: string; systemPrompt: string; model: string }) => {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ai', ...data }),
      })
      if (!response.ok) throw new Error('Failed to create AI agent')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      setNewAIName("")
      setNewAIPrompt("")
      setNewAIModel("")
      setIsNewAIOpen(false)
      toast({
        title: "Success",
        description: "AI agent created successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create AI agent",
        variant: "destructive",
      })
    },
  })

  // Mutation for updating AI agent
  const updateAIMutation = useMutation({
    mutationFn: async (data: { id: number; systemPrompt: string; model: string }) => {
      const response = await fetch('/api/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update AI agent')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      setEditingItem(null)
      setEditedPrompt("")
      setEditedModel("")
      toast({
        title: "Success",
        description: "AI agent updated successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update AI agent",
        variant: "destructive",
      })
    },
  })

  // Add mutation for updating folder_id
  const updateAIFolderMutation = useMutation({
    mutationFn: async ({ agentId, folderId }: { agentId: number; folderId: number | null }) => {
      const response = await fetch('/api/items/move', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, folderId }),
      })
      if (!response.ok) throw new Error('Failed to move AI agent')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      toast({
        title: "Success",
        description: "AI agent moved successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to move AI agent",
        variant: "destructive",
      })
    },
  })

  // Add new mutation for updating folder
  const updateFolderMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const response = await fetch('/api/items/folder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name }),
      })
      if (!response.ok) throw new Error('Failed to update folder')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      toast({
        title: "Success",
        description: "Folder updated successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update folder",
        variant: "destructive",
      })
    },
  })

  // Update handlers to use mutations
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
    createFolderMutation.mutate(newFolderName)
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
    createAIMutation.mutate({
      name: newAIName,
      systemPrompt: newAIPrompt,
      model: newAIModel,
    })
  }

  const handleEditAI = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editedPrompt.trim() || !editingItem) {
      toast({
        title: "Error",
        description: "Please enter a system prompt",
        variant: "destructive",
      })
      return
    }
    updateAIMutation.mutate({
      id: editingItem.id,
      systemPrompt: editedPrompt,
      model: editedModel,
    })
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const sourceId = result.draggableId
    const destinationId = result.destination.droppableId

    // If dropping into root
    if (destinationId === 'root') {
      updateAIFolderMutation.mutate({ agentId: parseInt(sourceId), folderId: null })
      return
    }

    // If dropping into a folder
    updateAIFolderMutation.mutate({
      agentId: parseInt(sourceId),
      folderId: parseInt(destinationId)
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
          systemPrompt={selectedItem.system_prompt || ""}
          agentName={selectedItem.name}
          model={selectedItem.model || "claude-3-5-sonnet-20241022"}
          onEdit={(systemPrompt, model) => {
            updateAIMutation.mutate({
              id: selectedItem.id,
              systemPrompt,
              model,
            })
          }}
        />
      </div>
    )
  }

  // Add loading states to UI
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (selectedFolder) {
    const folderAgents = itemsList.filter(
      (ai) => ai.type === "ai" && ai.folder_id === selectedFolder.id
    )

    return (
      <FolderView
        folder={selectedFolder}
        agents={folderAgents}
        onBack={() => setSelectedFolder(null)}
        onSelectAgent={setSelectedItem}
        onEditAgent={(agent) => {
          setEditingItem(agent)
          setEditedPrompt(agent.system_prompt || "")
          setEditedModel(agent.model || "claude-3-5-sonnet-20241022")
        }}
        onNewAI={() => setIsNewAIOpen(true)}
        onUpdateFolder={(id, name) => {
          updateFolderMutation.mutate({ id, name })
        }}
      />
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
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
        <Droppable droppableId="root" type="AI_AGENT">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-2 gap-3 p-3"
            >
              {itemsList.map((item, index) => (
                item.type === "folder" ? (
                  <Droppable droppableId={item.id.toString()} type="AI_AGENT" key={item.id}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex flex-col items-center justify-center aspect-square hover:bg-accent transition-colors p-3 ${snapshot.isDraggingOver ? "border-primary" : ""
                          }`}
                        onClick={() => {
                          const folderAgents = itemsList.filter(
                            (ai) => ai.type === "ai" && ai.folder_id === item.id
                          )
                          setSelectedFolder(item)
                        }}
                      >
                        <Folder className="h-8 w-8 mb-2 text-muted-foreground" />
                        <span className="text-sm text-center font-medium">{item.name}</span>
                        <span className="text-xs text-muted-foreground mt-1">
                          {itemsList.filter((ai) => ai.type === "ai" && ai.folder_id === item.id).length} agents
                        </span>
                        {provided.placeholder}
                      </Card>
                    )}
                  </Droppable>
                ) : item.folder_id === null && (
                  <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex flex-col items-center justify-center aspect-square hover:bg-accent cursor-move transition-colors p-3 relative"
                        onClick={(e) => {
                          if (!(e.target as HTMLElement).closest('button')) {
                            e.stopPropagation()
                            setSelectedItem(item)
                          }
                        }}
                      >
                        <Bot className="h-8 w-8 mb-2 text-muted-foreground" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 z-10 hover:bg-background/80"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingItem(item)
                            setEditedPrompt(item.system_prompt || "")
                            setEditedModel(item.model || "claude-3-5-sonnet-20241022")
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-center font-medium">{item.name}</span>
                        <span className="text-xs text-muted-foreground mt-1">
                          {item.model?.includes("haiku") ? "Haiku" : "Sonnet"}
                        </span>
                      </Card>
                    )}
                  </Draggable>
                )
              ))}
              {provided.placeholder}
              <Card
                className="flex flex-col items-center justify-center aspect-square hover:bg-accent cursor-pointer transition-colors p-3"
                onClick={() => setIsNewFolderOpen(true)}
              >
                <Plus className="h-8 w-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">Add New</span>
              </Card>
            </div>
          )}
        </Droppable>

        {/* Share Button */}
        <div className="fixed bottom-6 right-6">
          <Button size="icon" className="rounded-full h-12 w-12 shadow-lg">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </DragDropContext>
  )
}

