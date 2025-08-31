import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Clock, Users, Flag, Play, CheckCircle2, Circle, AlertTriangle, ChevronRight } from "lucide-react";

import { Task, UserProfile } from "@/types";
import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PremiumTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleStatus: (taskId: string) => void;
  onTogglePriority: (taskId: string) => void;
  onStartTimer: (taskId: string) => void;
  assignedProfiles: UserProfile[];
}

export function PremiumTaskCard({
  task,
  onEdit,
  onDelete,
  onToggleStatus,
  onTogglePriority,
  onStartTimer,
  assignedProfiles,
}: PremiumTaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const priorityColors = {
    low: "border-l-muted-foreground/30 bg-muted/20",
    medium: "border-l-warning bg-warning/5",
    high: "border-l-destructive bg-destructive/5",
  };

  const statusIcons = {
    todo: Circle,
    "in-progress": Clock,
    completed: CheckCircle2,
  };

  const StatusIcon = statusIcons[task.status];
  const isCompleted = task.status === "completed";
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;

  return (
    <Card 
      className={cn(
        "group transition-all duration-200 border-l-4 hover:shadow-medium cursor-pointer",
        priorityColors[task.priority],
        isCompleted && "opacity-75",
        isOverdue && "border-l-destructive bg-destructive/5"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onEdit(task)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Status Toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(task.id);
            }}
            className={cn(
              "mt-0.5 shrink-0",
              isCompleted && "text-success hover:text-success/80",
              task.status === "in-progress" && "text-warning hover:text-warning/80",
              task.status === "todo" && "text-muted-foreground hover:text-foreground"
            )}
          >
            <StatusIcon className="h-4 w-4" />
          </Button>

          {/* Task Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title and Priority */}
            <div className="flex items-start justify-between gap-2">
              <h3 className={cn(
                "font-medium text-sm leading-relaxed",
                isCompleted && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h3>
              
              <div className="flex items-center gap-1 shrink-0">
                {task.priority === "high" && (
                  <Flag className="h-3 w-3 text-destructive" />
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className={cn(
                        "opacity-0 group-hover:opacity-100 transition-opacity",
                        isHovered && "opacity-100"
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(task); }}>
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStartTimer(task.id); }}>
                      Start Timer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTogglePriority(task.id); }}>
                      Change Priority
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                      className="text-destructive"
                    >
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Due Date */}
                {task.dueDate && (
                  <div className={cn(
                    "flex items-center gap-1 text-xs",
                    isOverdue ? "text-destructive" : "text-muted-foreground"
                  )}>
                    <Clock className="h-3 w-3" />
                    {format(new Date(task.dueDate), "MMM d")}
                    {isOverdue && <AlertTriangle className="h-3 w-3" />}
                  </div>
                )}

                {/* Assigned Users */}
                {assignedProfiles.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <div className="flex -space-x-1">
                      {assignedProfiles.slice(0, 2).map((profile) => (
                        <Avatar key={profile.uid} className="h-5 w-5 border border-background">
                          <AvatarImage src={profile.photoURL || ""} />
                          <AvatarFallback className="text-[8px] bg-primary/20">
                            {profile.displayName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {assignedProfiles.length > 2 && (
                        <div className="h-5 w-5 rounded-full bg-muted border border-background flex items-center justify-center">
                          <span className="text-[8px] font-medium">+{assignedProfiles.length - 2}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <Badge 
                variant={task.status === "completed" ? "default" : "secondary"}
                className="text-[10px] px-2 py-0.5 capitalize"
              >
                {task.status.replace("-", " ")}
              </Badge>
            </div>
          </div>

          {/* Action Arrow */}
          <ChevronRight 
            className={cn(
              "h-4 w-4 text-muted-foreground/30 transition-all shrink-0 mt-0.5",
              "group-hover:text-muted-foreground group-hover:translate-x-1"
            )} 
          />
        </div>
      </CardContent>
    </Card>
  );
}