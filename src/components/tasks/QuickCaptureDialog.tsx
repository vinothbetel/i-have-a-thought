// Quick task creation dialog
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Plus, Send, X } from 'lucide-react';
import { useHapticFeedback } from '../../hooks/useTouchGestures';

interface QuickCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask?: (taskData: any) => void;
}

export function QuickCaptureDialog({
  open,
  onOpenChange,
  onCreateTask
}: QuickCaptureDialogProps) {
  const [inputText, setInputText] = useState('');
  const { notification } = useHapticFeedback();

  // Handle task creation
  const handleCreateTask = () => {
    if (!inputText.trim()) return;

    const taskData = { title: inputText.trim() };
    onCreateTask?.(taskData);
    onOpenChange(false);
    setInputText('');
    notification('success');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateTask();
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4 sm:mx-auto rounded-2xl border-2 border-primary/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            Add Quick Task
          </DialogTitle>
          <DialogDescription>
            What would you like to accomplish?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <Textarea
            placeholder="Describe your task..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="min-h-[120px] text-base leading-relaxed border-2 border-muted focus:border-primary/50 rounded-xl resize-none"
            autoFocus
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 h-12 rounded-xl border-2 hover:bg-muted/50 transition-all"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={!inputText.trim()}
              variant="focus"
              className="flex-1 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Send className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
          
          {/* Hint text */}
          <p className="text-xs text-muted-foreground text-center mt-2">
            Press Enter to create • Swipe to dismiss
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}