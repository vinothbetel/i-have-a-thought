import { useState } from "react"
import { Clock, Edit, Trash2, Play, CheckCircle, Star, Calendar, Users } from "lucide-react"
import { TaskComments } from './TaskComments'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Task, UserProfile } from "@/types"
import { useTaskTimeTracker } from "@/contexts/TaskTimeTrackerContext"

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onToggleStatus: (taskId: string) => void
  onTogglePriority: (taskId: string) => void
  onStartTimer: (taskId: string) => void
  assignedProfiles: UserProfile[]
}

export function TaskCard({ task, onEdit, onDelete, onToggleStatus, onTogglePriority, onStartTimer, assignedProfiles }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { trackingTask, isTracking, startTracking, stopTracking, getFormattedTime } = useTaskTimeTracker()
  
  const isCurrentlyTracking = trackingTask?.id === task.id

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onEdit(task);
  }

  const handleTimeTrackingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentlyTracking) {
      stopTracking();
    } else {
      startTracking(task);
    }
  }
  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed"

  return (
    <div 
      className={cn(
        "group relative bg-card/60 backdrop-blur-md border rounded-xl p-4 transition-all duration-200 cursor-pointer hover:shadow-elegant hover:bg-card/90 hover:border-primary/30 hover:scale-[1.01]",
        task.status === "completed" && "opacity-70 hover:opacity-90",
        isOverdue && "border-destructive/30 bg-destructive/5",
        isCurrentlyTracking && "ring-2 ring-focus/30 border-focus/50 bg-focus/5"
      )}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-6 w-6 rounded-full transition-all duration-200 shrink-0 mt-0.5",
            task.status === "completed" 
              ? "text-success hover:bg-success/10 bg-success/5" 
              : "hover:bg-primary/10 border border-border/50 hover:border-primary/50"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus(task.id);
          }}
        >
          <CheckCircle className={cn(
            "h-4 w-4 transition-all duration-200",
            task.status === "completed" ? "fill-current" : ""
          )} />
        </Button>

        {/* Task Content */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className={cn(
            "font-medium text-base leading-relaxed transition-all duration-200",
            task.status === "completed" && "line-through text-muted-foreground"
          )}>
            {task.title}
          </div>
          
          {task.description && (
            <div className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {task.description}
            </div>
          )}
          
          {/* Task Meta Information */}
          {(task.dueDate || task.estimatedTime || task.timeSpent) && (
            <div className="flex items-center gap-3 text-xs">
              {task.dueDate && (
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full transition-colors",
                  isOverdue 
                    ? "bg-destructive/10 text-destructive border border-destructive/20" 
                    : "bg-muted/50 text-muted-foreground"
                )}>
                  <Calendar className="h-3 w-3" />
                  <span className="font-medium">{formatDueDate(task.dueDate)}</span>
                </div>
              )}
              
              {task.estimatedTime && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-focus/10 text-focus border border-focus/20">
                  <Clock className="h-3 w-3" />
                  <span className="font-medium">{task.estimatedTime}m</span>
                </div>
              )}
              
              {task.timeSpent && task.timeSpent > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success border border-success/20">
                  <Clock className="h-3 w-3" />
                  <span className="font-medium">{getFormattedTime(task.timeSpent)} tracked</span>
                </div>
              )}
            </div>
          )}

          {/* Assigned Members and Team Indicator */}
          {(assignedProfiles.length > 0 || task.teamId) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {assignedProfiles.length > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50">
                  <Users className="h-3 w-3" />
                  <span>Assigned to</span>
                  <div className="flex -space-x-2 overflow-hidden ml-1">
                    <TooltipProvider>
                      {assignedProfiles.map((profile) => (
                        <Tooltip key={profile.uid}>
                          <TooltipTrigger asChild>
                            <Avatar className="h-5 w-5 border-2 border-background">
                              <AvatarImage src={profile.photoURL || ""} />
                              <AvatarFallback className="text-[8px] bg-primary/20 text-primary">
                                {profile.displayName?.charAt(0).toUpperCase() || profile.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            {profile.displayName || profile.email}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </div>
                </div>
              )}
              {task.teamId && (
                <Badge variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  Team Task
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Priority Star */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-6 w-6 rounded-full transition-all duration-200 shrink-0 mt-0.5",
            task.priority === "high" 
              ? "text-yellow-500 hover:bg-yellow-500/10 bg-yellow-500/5" 
              : "text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePriority(task.id);
          }}
        >
          <Star className={cn(
            "h-4 w-4 transition-all duration-200",
            task.priority === "high" ? "fill-current" : ""
          )} />
        </Button>
      </div>

      {/* Action Buttons (shown on hover) */}
      <div className={cn(
        "absolute top-2 right-2 flex items-center gap-1 transition-all duration-200",
        "right-12", // Move buttons further left to avoid overlap with star and time tracking
        isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
      )}>
        {/* Time Tracking Button */}
        {task.status !== "completed" && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 rounded-lg transition-all duration-200 backdrop-blur-sm bg-background/80",
              isCurrentlyTracking 
                ? "text-focus hover:bg-focus/20 bg-focus/10 ring-1 ring-focus/30" 
                : "hover:bg-focus/10 hover:text-focus"
            )}
            onClick={handleTimeTrackingClick}
            title={isCurrentlyTracking ? "Stop tracking time" : "Start tracking time"}
          >
            <Clock className={cn(
              "h-3 w-3 transition-all duration-200",
              isCurrentlyTracking && "animate-pulse"
            )} />
          </Button>
        )}

        {task.status !== "completed" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg hover:bg-focus/10 hover:text-focus transition-all duration-200 backdrop-blur-sm bg-background/80"
            onClick={(e) => {
              e.stopPropagation();
              onStartTimer(task.id);
            }}
            title="Start timer"
          >
            <Play className="h-3 w-3" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg hover:bg-muted transition-all duration-200 backdrop-blur-sm bg-background/80"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          title="Edit task"
        >
          <Edit className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all duration-200 backdrop-blur-sm bg-background/80"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          title="Delete task"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Time Tracking Indicator */}
      {isCurrentlyTracking && (
        <div className="absolute -top-1 -right-1 h-3 w-3 bg-focus rounded-full animate-pulse shadow-glow" />
      )}
      
      {/* Comments Section */}
      <div className="mt-4 border-t pt-4">
        <TaskComments taskId={task.id} />
      </div>
    </div>
  )
}