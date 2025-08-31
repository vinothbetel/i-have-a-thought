import { memo, useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  Users, 
  Star, 
  StarOff,
  Play,
  Pause,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { Task, UserProfile } from '../../types';
import { useSwipeGestures, useHapticFeedback } from '../../hooks/useTouchGestures';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { DeleteConfirmationDialog } from '../common/DeleteConfirmationDialog';
import { cn } from '../../lib/utils';
// --- CHANGE 1: Import TaskComments ---
import { TaskComments } from './TaskComments';

interface MobileTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleStatus: (taskId: string) => void;
  onTogglePriority: (taskId: string) => void;
  onStartTimer?: (taskId: string) => void;
  assignedProfiles?: UserProfile[];
  isTimeTracking?: boolean;
}

export const MobileTaskCard = memo(function MobileTaskCard({
  task,
  onEdit,
  onDelete,
  onToggleStatus,
  onTogglePriority,
  onStartTimer,
  assignedProfiles = [],
  isTimeTracking = false
}: MobileTaskCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { impact, notification } = useHapticFeedback();

  const swipeRef = useSwipeGestures({
    onSwipeLeft: () => {
      impact('medium');
      setShowDeleteDialog(true);
    },
    onSwipeRight: () => {
      impact('light');
      onToggleStatus(task.id);
    },
    // onTap is removed here because the new onClick handler on the inner div is more reliable
    // and prevents accidental edits when clicking buttons.
  }, {
    threshold: 60,
    velocityThreshold: 0.15,
    ignoreTapFromInteractive: true
  });

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const isCompleted = task.status === 'completed';

  const handleDeleteConfirm = () => {
    onDelete(task.id);
    notification('error');
    setShowDeleteDialog(false);
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `${diffDays} days`;
  };

  const formatTimeSpent = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // --- CHANGE 2: The entire return block is replaced with this new structure ---
  return (
    <div className="flex flex-col">
      <Card 
        ref={swipeRef as any}
        className={cn(
          "relative transition-all duration-200 touch-manipulation touch-pan-y z-10 mx-1",
          "min-h-[100px] shadow-md hover:shadow-lg", // Increased min height and better shadows
          isCompleted && "opacity-75 bg-muted/50",
          isOverdue && !isCompleted && "border-destructive/50 bg-destructive/5",
          isTimeTracking && "ring-2 ring-primary/50 border-primary/50",
          "border border-border/50 rounded-xl" // Better border definition
        )}
      >
        <div 
          className="p-4 sm:p-5" // Increased padding for better touch targets
          onClick={(e) => {
            const target = e.target as Element;
            // This logic correctly triggers edit only when clicking on non-interactive parts of the card
            if (e.target === e.currentTarget || !target.closest('button, a, [role="menuitem"]')) {
              onEdit(task);
            }
          }}
        >
          <div className="flex items-start gap-4"> {/* Increased gap for better spacing */}
            {/* Status Toggle - Larger touch target */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus(task.id);
                impact('light');
              }}
              variant="ghost"
              size="sm"
              className="p-0 h-10 w-10 min-w-[40px] shrink-0 rounded-full hover:bg-primary/10 transition-all" // Larger touch target
            >
              {isCompleted ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground hover:text-foreground" />
              )}
            </Button>

            {/* Task Content */}
            <div className="flex-1 min-w-0 space-y-3"> {/* Increased spacing */}
              {/* Title and Priority */}
              <div className="flex items-start justify-between gap-3">
                <h3 className={cn(
                  "font-semibold text-base leading-relaxed line-clamp-2", // Larger text and better line height
                  isCompleted && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </h3>
                
                <div className="flex items-center gap-2 shrink-0">
                  {/* Priority Star - Larger touch target */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePriority(task.id);
                      impact('light');
                    }}
                    variant="ghost"
                    size="sm"
                    className="p-0 h-10 w-10 rounded-full hover:bg-yellow-500/10 transition-all" // Larger touch target
                  >
                    {task.priority === 'high' ? (
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <StarOff className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>

                  {/* Mobile Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-10 w-10 rounded-full hover:bg-muted/50 transition-all" // Larger touch target
                        onClick={(e) => {
                          e.stopPropagation();
                          impact('light');
                        }}
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 shadow-lg">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(task);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-3" />
                        Edit Task
                      </DropdownMenuItem>
                      {onStartTimer && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartTimer(task.id);
                          }}
                        >
                          {isTimeTracking ? (
                            <>
                              <Pause className="h-4 w-4 mr-3" />
                              Stop Timer
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-3" />
                              Start Timer
                            </>
                          )}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteDialog(true);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-3" />
                        Delete Task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Description */}
              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed"> {/* Improved text size and line height */}
                  {task.description}
                </p>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-2 text-xs mt-3"> {/* Added margin top for better separation */}
                {task.dueDate && (
                  <Badge variant={isOverdue ? "destructive" : "outline"} className="h-6 text-xs px-2 py-1">
                    <Calendar className="h-3 w-3 mr-1.5" />{formatDueDate(task.dueDate)}
                  </Badge>
                )}
                {task.estimatedTime && (
                  <Badge variant="secondary" className="h-6 text-xs px-2 py-1">
                    <Clock className="h-3 w-3 mr-1.5" />{task.estimatedTime}m
                  </Badge>
                )}
                {task.timeSpent && task.timeSpent > 0 && (
                  <Badge variant="outline" className="h-6 text-xs px-2 py-1">
                    <Clock className="h-3 w-3 mr-1.5" />{formatTimeSpent(task.timeSpent)}
                  </Badge>
                )}
                {assignedProfiles.length > 0 && (
                  <Badge variant="outline" className="h-6 text-xs px-2 py-1">
                    <Users className="h-3 w-3 mr-1.5" />{assignedProfiles.length}
                  </Badge>
                )}
                <Badge variant={task.status === 'completed' ? 'default' : 'secondary'} className="h-6 text-xs px-2 py-1">
                  {task.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* --- CHANGE 3: The TaskComments component is added here --- */}
        <div className="px-4 pb-3 border-t border-border/30 mt-2"> {/* Better separation and padding */}
          <TaskComments taskId={task.id} />
        </div>

        {/* Time Tracking Indicator */}
        {isTimeTracking && (
          <div className="absolute top-3 right-3">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-glow" />
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        itemName={task.title}
      />
    </div>
  );
});
