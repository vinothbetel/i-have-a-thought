import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TaskCard } from "@/components/tasks/TaskCard"
import { MobileTaskCard } from "@/components/tasks/MobileTaskCard"
import { TaskForm } from "@/components/tasks/TaskForm"
import { FloatingActionButton } from "@/components/tasks/FloatingActionButton"

import { StaggeredList } from "@/components/ui/smooth-transitions"
import { useTasks } from "@/contexts/TasksContext"
import { useTimer } from "@/contexts/TimerContext"
import { useOfflineSync } from "@/hooks/useOfflineSync"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState, useEffect, useCallback, useMemo } from "react"
import { CheckSquare, Clock } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Task, UserProfile } from "@/types"
import { cn } from "@/lib/utils"

export default function TasksPage() {
  const { tasks, teamMembers, addTask, updateTask, deleteTask, toggleTaskStatus, toggleTaskPriority, setTaskFormActive } = useTasks()
  const { startTaskTimer } = useTimer()
  const { user, userProfile } = useAuth()
  const { createTaskOffline, updateTaskOffline, deleteTaskOffline, toggleTaskStatusOffline } = useOfflineSync()
  const isMobile = useIsMobile()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [quickTaskTitle, setQuickTaskTitle] = useState("")
  
  // Manage form active state for real-time updates
  useEffect(() => {
    const isFormActive = !!editingTask;
    setTaskFormActive(isFormActive);
    
    return () => {
      // Cleanup: ensure form is marked as inactive when component unmounts
      setTaskFormActive(false);
    };
  }, [editingTask, setTaskFormActive]);

  // Memoized filtered tasks for better performance
  const { todoTasks, completedTasks } = useMemo(() => ({
    todoTasks: tasks.filter(task => task.status !== "completed"),
    completedTasks: tasks.filter(task => task.status === "completed")
  }), [tasks])

  const handleCreateTask = async (taskData: Omit<Task, "id" | "createdAt">) => {
    if (!user?.uid) return;
    
    if (navigator.onLine) {
      addTask({ ...taskData, createdBy: user.uid });
    } else {
      await createTaskOffline(taskData, user.uid);
    }
    setEditingTask(null);
  };

  const handleEditTask = async (taskData: Omit<Task, "id" | "createdAt">) => {
    if (!editingTask || !user?.uid) return;
    
    if (navigator.onLine) {
      updateTask(editingTask.id, taskData);
    } else {
      await updateTaskOffline(editingTask.id, taskData, user.uid);
    }
    setEditingTask(null);
  };

  const handleQuickAddTask = async () => {
    if (!quickTaskTitle.trim() || !user?.uid) return;
    
    const taskData = {
      title: quickTaskTitle.trim(),
      priority: "medium" as const,
      status: "todo" as const,
      createdBy: user.uid,
    };
    
    if (navigator.onLine) {
      addTask(taskData);
    } else {
      await createTaskOffline(taskData, user.uid);
    }
    
    setQuickTaskTitle("");
  };

  const handleStartTimer = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) startTaskTimer(task);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user?.uid) return;
    
    if (navigator.onLine) {
      deleteTask(taskId);
    } else {
      await deleteTaskOffline(taskId, user.uid);
    }
  };

  const handleToggleStatus = async (taskId: string) => {
    if (!user?.uid) return;
    
    if (navigator.onLine) {
      toggleTaskStatus(taskId);
    } else {
      await toggleTaskStatusOffline(taskId, user.uid);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleQuickAddTask()
    }
  }

  const getAssignedProfiles = (assignedToUids?: string[]): UserProfile[] => {
    if (!assignedToUids || assignedToUids.length === 0) return [];
    return assignedToUids
      .map(uid => teamMembers.find(member => member.uid === uid))
      .filter((profile): profile is UserProfile => profile !== undefined);
  };

  // Quick capture handler for FAB
  const handleQuickCapture = useCallback(async (taskData: any) => {
    if (!user?.uid) return;
    
    const fullTaskData = {
      ...taskData,
      status: "todo" as const,
      createdBy: user.uid,
    };
    
    if (navigator.onLine) {
      addTask({ ...fullTaskData, createdAt: new Date().toISOString() });
    } else {
      await createTaskOffline(fullTaskData, user.uid);
    }
  }, [user?.uid, addTask, createTaskOffline]);

  return (
    <>
      <div className="relative h-full flex flex-col">
        <div className="h-full overflow-y-auto scrollbar-hide touch-pan-y">
          <div className="container max-w-7xl mx-auto p-0 md:p-6 flex flex-col flex-1 min-h-0">
            
            {isMobile ? (
              /* ==================================================================== */
              /* =========== ELEGANT & MODERN MOBILE UI (NEW VERSION) ============= */
              /* ==================================================================== */
              <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900/50">
                {/* --- Mobile Header --- */}
                <header className="text-center pt-6 pb-4 px-4 bg-background">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-focus bg-clip-text text-transparent">
                    My Day
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </p>
                </header>

                {/* --- Mobile Content (Scrollable) --- */}
                <main className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                  <div className="space-y-8 px-4 py-4 pb-28">
                    {/* --- Active Tasks Section --- */}
                    <section>
                      <div className="flex items-center gap-3 p-3 bg-card rounded-xl border shadow-sm mb-4">
                        <CheckSquare className="h-5 w-5 text-primary" />
                        <h2 className="text-base font-semibold text-foreground">Active Tasks</h2>
                        <div className="ml-auto bg-primary/10 text-primary text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                          {todoTasks.length}
                        </div>
                      </div>
                      
                      {todoTasks.length === 0 ? (
                        <div className="text-center py-12 px-4 space-y-4 bg-background rounded-2xl border border-dashed">
                           <div className="h-24 w-24 bg-gradient-to-br from-primary/5 to-primary/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <CheckSquare className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                              All clear for today!
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                              Tap the <Plus className="inline h-3.5 w-3.5" /> button below to add a new task.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <StaggeredList className="space-y-3">
                          {todoTasks.map(task => (
                            <MobileTaskCard
                              key={task.id}
                              task={task}
                              onEdit={setEditingTask}
                              onDelete={handleDeleteTask}
                              onToggleStatus={handleToggleStatus}
                              onTogglePriority={toggleTaskPriority}
                              onStartTimer={handleStartTimer}
                              assignedProfiles={getAssignedProfiles(task.assignedTo)}
                            />
                          ))}
                        </StaggeredList>
                      )}
                    </section>
                    
                    {/* --- Completed Tasks Section --- */}
                    {completedTasks.length > 0 && (
                      <section>
                         <div className="flex items-center gap-3 p-3 bg-card rounded-xl border shadow-sm mb-4">
                          <Clock className="h-5 w-5 text-success" />
                          <h2 className="text-base font-semibold text-foreground">Completed</h2>
                          <div className="ml-auto bg-success/10 text-success text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                            {completedTasks.length}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {completedTasks.map(task => (
                            <MobileTaskCard
                              key={task.id}
                              task={task}
                              onEdit={setEditingTask}
                              onDelete={handleDeleteTask}
                              onToggleStatus={handleToggleStatus}
                              onTogglePriority={toggleTaskPriority}
                              onStartTimer={handleStartTimer}
                              assignedProfiles={getAssignedProfiles(task.assignedTo)}
                            />
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                </main>
              </div>

            ) : (
              /* ==================================================================== */
              /* ================= DESKTOP UI LAYOUT (Unchanged) ================== */
              /* ==================================================================== */
              <div className="p-4 md:p-6">
                <div className={cn("text-center space-y-2 mb-6")}>
                    <h1 className={cn("font-bold bg-gradient-to-r from-primary to-focus bg-clip-text text-transparent text-3xl md:text-4xl")}>
                        My Day
                    </h1>
                    <p className={cn("text-muted-foreground text-base md:text-lg")}>
                        {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                        })}
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
                  {/* Active Tasks Column */}
                  <div className="flex flex-col space-y-4 flex-1 min-h-0 px-2">
                    <div className="flex items-center gap-2 px-2">
                      <CheckSquare className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-semibold">My Tasks</h2>
                      <div className="ml-auto bg-primary/10 text-primary px-2 py-1 rounded-full text-sm font-medium">
                        {todoTasks.length}
                      </div>
                    </div>
                    
                    <ScrollArea className="flex-1 min-h-0">
                      <div className="space-y-2 pr-2">
                        {todoTasks.length === 0 ? (
                          <div className="text-center py-12 space-y-3 mx-2">
                            <div className="h-20 w-20 bg-gradient-to-br from-primary/10 to-focus/10 rounded-2xl flex items-center justify-center mx-auto shadow-elegant">
                              <CheckSquare className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                No tasks yet
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Add your first task below to get started
                              </p>
                            </div>
                          </div>
                        ) : (
                          todoTasks.map(task => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onEdit={setEditingTask}
                              onDelete={handleDeleteTask}
                              onToggleStatus={handleToggleStatus}
                              onTogglePriority={toggleTaskPriority}
                              onStartTimer={handleStartTimer}
                              assignedProfiles={getAssignedProfiles(task.assignedTo)}
                            />
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Completed Tasks Column */}
                  <div className="flex flex-col space-y-4 flex-1 min-h-0 px-2">
                    <div className="flex items-center gap-2 px-2">
                      <Clock className="h-5 w-5 text-success" />
                      <h2 className="text-xl font-semibold">Completed</h2>
                      <div className="ml-auto bg-success/10 text-success px-2 py-1 rounded-full text-sm font-medium">
                        {completedTasks.length}
                      </div>
                    </div>
                    
                    <ScrollArea className="flex-1 min-h-0">
                      <div className="space-y-2 pr-2">
                        {completedTasks.length === 0 ? (
                          <div className="text-center py-16 space-y-4">
                            <div className="h-20 w-20 bg-gradient-to-br from-success/10 to-success/20 rounded-2xl flex items-center justify-center mx-auto shadow-elegant">
                              <Clock className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                No completed tasks
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Completed tasks will appear here
                              </p>
                            </div>
                          </div>
                        ) : (
                          completedTasks.map(task => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onEdit={setEditingTask}
                              onDelete={handleDeleteTask}
                              onToggleStatus={handleToggleStatus}
                              onTogglePriority={toggleTaskPriority}
                              onStartTimer={handleStartTimer}
                              assignedProfiles={getAssignedProfiles(task.assignedTo)}
                            />
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Quick Add Bar */}
        {!isMobile && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-6">
            <div className="flex items-center gap-3 bg-card/90 backdrop-blur-lg rounded-xl border-2 border-primary/20 shadow-elegant shadow-glow p-4 transition-smooth ring-2 ring-primary/30 hover:ring-primary/40">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-smooth hover:scale-110 shrink-0" onClick={handleQuickAddTask}>
                <Plus className="h-4 w-4" />
              </Button>
              <Input
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a task"
                className="border-none shadow-none focus-visible:ring-0 bg-transparent text-base placeholder:text-muted-foreground/70 flex-1 focus:placeholder:text-muted-foreground/50"
              />
              {quickTaskTitle.trim() && (
                <Button onClick={handleQuickAddTask} variant="focus" size="sm" className="hover-scale shadow-md">
                  Add
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Floating Action Button */}
        {isMobile && <FloatingActionButton onCreateTask={handleQuickCapture} />}
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="sm:max-w-[500px] shadow-elegant">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              Edit Task
            </DialogTitle>
          </DialogHeader>
          {editingTask && (
            <TaskForm
              task={editingTask}
              onSubmit={handleEditTask}
              onCancel={() => setEditingTask(null)}
              teamMembers={teamMembers}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}