import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ModernQuickCaptureDialog } from "./ModernQuickCaptureDialog";
import { cn } from "@/lib/utils";
import { Plus, Zap } from "lucide-react";

export function ModernFloatingActionButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <>
      <ModernQuickCaptureDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
      >
        <Button
          size="icon-lg"
          variant="premium"
          className={cn(
            "fixed bottom-6 right-6 h-16 w-16 rounded-2xl shadow-large z-50",
            "hover:shadow-glow transition-all duration-200 hover:scale-105 active:scale-95",
            "touch-target pb-safe mb-safe"
          )}
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </ModernQuickCaptureDialog>
    </>
  );
}