import { useState } from 'react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { QuickCaptureDialog } from './QuickCaptureDialog';

interface ModernFloatingActionButtonProps {
  onCreateTask?: (taskData: any) => void;
  className?: string;
}

export function ModernFloatingActionButton({ 
  onCreateTask,
  className 
}: ModernFloatingActionButtonProps) {
  const [showQuickCapture, setShowQuickCapture] = useState(false);

  const handleClick = () => {
    setShowQuickCapture(true);
  };

  return (
    <>
      <div className={cn(
        "fixed bottom-6 right-6 z-50 mb-safe mr-safe",
        className
      )}>
        <Button
          onClick={handleClick}
          className={cn(
            "h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
            "transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white/20",
            "shadow-glow hover:shadow-xl"
          )}
        >
          <Plus className="h-7 w-7 text-white drop-shadow-sm" />
        </Button>
      </div>

      <QuickCaptureDialog
        open={showQuickCapture}
        onOpenChange={setShowQuickCapture}
        onCreateTask={onCreateTask}
      />
    </>
  );
}