import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTasks } from "@/contexts/TasksContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { Task } from "@/types";
import {
  Plus,
  Zap,
  Clock,
  Tag,
  User,
  Flame,
  Target,
  X,
  Check,
  Sparkles
} from "lucide-react";

interface ModernQuickCaptureDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

const priorityOptions = [
  { value: "low", label: "Low", icon: Target, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950" },
  { value: "medium", label: "Medium", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950" },
  { value: "high", label: "High", icon: Flame, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950" },
];

const quickSuggestions = [
  "Review project proposal",
  "Call team meeting",
  "Update documentation", 
  "Fix critical bug",
  "Prepare presentation",
  "Send weekly report"
];

export function ModernQuickCaptureDialog({ open, onOpenChange, children }: ModernQuickCaptureDialogProps) {
  const [isOpen, setIsOpen] = useState(open || false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isMobile = useIsMobile();
  const { addTask } = useTasks();
  const { user } = useAuth();
  const { toast } = useToast();
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
    if (newOpen) {
      // Focus the input after a brief delay for smooth animation
      setTimeout(() => titleInputRef.current?.focus(), 100);
    } else {
      // Reset form when closing
      setTitle("");
      setDescription("");
      setPriority("medium");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a task title",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status: "todo",
        createdBy: user?.uid || null,
      });

      toast({
        title: "Task created! ✨",
        description: `"${title}" has been added to your tasks`,
      });

      handleOpenChange(false);
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error creating task",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setTitle(suggestion);
    titleInputRef.current?.focus();
  };

  const selectedPriority = priorityOptions.find(p => p.value === priority);

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Task Title */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          What needs to be done?
        </label>
        <Input
          ref={titleInputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your task..."
          className="border-0 bg-muted/30 text-base h-12 focus:bg-background transition-smooth"
          autoComplete="off"
        />
      </div>

      {/* Quick Suggestions */}
      {!title && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Quick suggestions
          </p>
          <div className="grid grid-cols-2 gap-2">
            {quickSuggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="justify-start text-left h-auto p-3 bg-muted/20 hover:bg-muted/40 border-muted"
              >
                <span className="text-xs truncate">{suggestion}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Priority Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Priority</label>
        <div className="grid grid-cols-3 gap-2">
          {priorityOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = priority === option.value;
            return (
              <Button
                key={option.value}
                type="button"
                variant="outline"
                onClick={() => setPriority(option.value as Task["priority"])}
                className={cn(
                  "flex flex-col gap-2 h-16 transition-smooth",
                  isSelected
                    ? `${option.bg} border-current ${option.color} shadow-sm`
                    : "hover:bg-muted/30"
                )}
              >
                <Icon className={cn("h-4 w-4", isSelected ? option.color : "text-muted-foreground")} />
                <span className={cn("text-xs font-medium", isSelected ? option.color : "text-muted-foreground")}>
                  {option.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Description (Optional) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Add details (optional)
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add any additional notes..."
          rows={3}
          className="border-0 bg-muted/30 resize-none focus:bg-background transition-smooth"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOpenChange(false)}
          className="flex-1"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="flex-1 gradient-primary text-white hover:shadow-glow transition-smooth"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Creating...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Create Task
            </>
          )}
        </Button>
      </div>
    </form>
  );

  const TriggerButton = children || (
    <Button 
      size={isMobile ? "icon" : "default"}
      className="gradient-primary text-white hover:shadow-glow transition-smooth touch-target"
    >
      <Plus className="h-4 w-4" />
      {!isMobile && <span className="ml-2">Quick Add</span>}
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>
          {TriggerButton}
        </DrawerTrigger>
        <DrawerContent className="pb-safe">
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-2 text-xl">
              <Zap className="h-5 w-5 text-primary" />
              Quick Add Task
            </DrawerTitle>
            <DrawerDescription>
              Capture your thoughts instantly
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <FormContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {TriggerButton}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Zap className="h-5 w-5 text-primary" />
            Quick Add Task
          </DialogTitle>
          <DialogDescription>
            Capture your thoughts instantly
          </DialogDescription>
        </DialogHeader>
        <FormContent />
      </DialogContent>
    </Dialog>
  );
}