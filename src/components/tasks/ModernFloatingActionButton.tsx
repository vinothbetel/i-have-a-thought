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
          size="icon"
          className={cn(
            "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-large z-50",
            "gradient-primary text-white hover:shadow-glow transition-smooth",
            "touch-target pb-safe",
            // Add safe area consideration
            "mb-safe"
          )}
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </ModernQuickCaptureDialog>
    </>
  );
}