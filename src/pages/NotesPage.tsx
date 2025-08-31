import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Plus, 
  Pencil, 
  Save, 
  Trash2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Note {
  id: string
  title: string
  content: string
  type: "text"
  createdAt: string
  updatedAt: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem("mindmeld-notes")
    return saved ? JSON.parse(saved) : []
  })
  
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [newNoteTitle, setNewNoteTitle] = useState("")
  const [textContent, setTextContent] = useState("")
  
  const { toast } = useToast()

  const saveNotesToStorage = (updatedNotes: Note[]) => {
    localStorage.setItem("mindmeld-notes", JSON.stringify(updatedNotes))
    setNotes(updatedNotes)
  }

  const createNewNote = () => {
    if (!newNoteTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note.",
        variant: "destructive"
      })
      return
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title: newNoteTitle,
      content: "",
      type: "text",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedNotes = [newNote, ...notes]
    saveNotesToStorage(updatedNotes)
    setActiveNote(newNote)
    setNewNoteTitle("")
    setTextContent("")
    
    toast({
      title: "Note created",
      description: "Your new note has been created successfully.",
    })
  }

  const saveCurrentNote = async () => {
    if (!activeNote) return

    const updatedNote: Note = {
      ...activeNote,
      content: textContent,
      type: "text",
      updatedAt: new Date().toISOString()
    }

    const updatedNotes = notes.map(note => 
      note.id === activeNote.id ? updatedNote : note
    )
    
    saveNotesToStorage(updatedNotes)
    setActiveNote(updatedNote)
    
    toast({
      title: "Note saved",
      description: "Your note has been saved successfully.",
    })
  }

  const selectNote = (note: Note) => {
    setActiveNote(note)
    setTextContent(note.content)
  }

  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId)
    saveNotesToStorage(updatedNotes)
    
    if (activeNote?.id === noteId) {
      setActiveNote(null)
      setTextContent("")
    }
    
    toast({
      title: "Note deleted",
      description: "The note has been removed.",
      variant: "destructive"
    })
  }

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-muted-foreground">
            Create and organize your text notes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Notes List Sidebar */}
        <Card className="lg:col-span-1 shadow-elegant">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              My Notes
            </CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Note title..."
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && createNewNote()}
                className="flex-1"
              />
              <Button 
                onClick={createNewNote}
                size="icon"
                variant="focus"
                className="hover-scale"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-smooth hover-scale",
                      activeNote?.id === note.id 
                        ? "bg-primary/10 border-primary/30" 
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => selectNote(note)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{note.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant="secondary" 
                          className="text-xs"
                        >
                          📝
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNote(note.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {notes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Pencil className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notes yet</p>
                    <p className="text-xs">Create your first note above</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Editor */}
        <div className="lg:col-span-3">
          {activeNote ? (
            <Card className="h-full shadow-elegant">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span>{activeNote.title}</span>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={saveCurrentNote}
                      variant="focus"
                      size="sm"
                      className="hover-scale"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-0">
                <div className="h-full p-6">
                  <Textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Write your notes here..."
                    className="h-full resize-none text-base leading-relaxed"
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full shadow-elegant flex items-center justify-center">
              <div className="text-center space-y-4">
                <Pencil className="h-16 w-16 mx-auto text-muted-foreground/50" />
                <div>
                  <h3 className="text-lg font-medium text-muted-foreground">
                    Select a note to start editing
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a note from the sidebar or create a new one
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}