import { useTasks } from "@/contexts/TasksContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  Activity,
  Calendar,
  Flame,
  Award,
  Timer,
  Zap
} from "lucide-react";

export default function AnalyticsPage() {
  const {
    tasks,
    getTotalTasksCount,
    getCompletedTasksCount,
    getActiveTasksCount,
    getCurrentStreak,
    getLongestStreak,
    getTasksByStatus,
    getTasksByPriority,
  } = useTasks();

  // Calculate statistics
  const totalTasks = getTotalTasksCount();
  const completedTasks = getCompletedTasksCount();
  const activeTasks = getActiveTasksCount();
  const currentStreak = getCurrentStreak();
  const longestStreak = getLongestStreak();
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Task breakdown by status
  const todoTasks = getTasksByStatus("todo").length;
  const inProgressTasks = getTasksByStatus("in-progress").length;

  // Task breakdown by priority
  const highPriorityTasks = getTasksByPriority("high").length;
  const mediumPriorityTasks = getTasksByPriority("medium").length;
  const lowPriorityTasks = getTasksByPriority("low").length;

  // Time tracking analytics
  const calculateTimeAnalytics = () => {
    const totalTimeSpent = tasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0);
    const totalEstimatedTime = tasks.reduce((sum, task) => sum + ((task.estimatedTime || 0) * 60), 0);
    const tasksWithTime = tasks.filter(task => task.timeSpent && task.timeSpent > 0);
    const averageTimePerTask = tasksWithTime.length > 0 
      ? Math.round(totalTimeSpent / tasksWithTime.length) 
      : 0;
    
    const timeAccuracy = totalEstimatedTime > 0 
      ? Math.round((totalTimeSpent / totalEstimatedTime) * 100)
      : 0;

    const completedTasksWithTime = tasks.filter(task => 
      task.status === "completed" && task.timeSpent && task.timeSpent > 0
    );
    
    const averageCompletionTime = completedTasksWithTime.length > 0
      ? Math.round(completedTasksWithTime.reduce((sum, task) => sum + (task.timeSpent || 0), 0) / completedTasksWithTime.length)
      : 0;

    return {
      totalTimeSpent,
      totalEstimatedTime,
      averageTimePerTask,
      timeAccuracy,
      averageCompletionTime,
      tasksWithTimeCount: tasksWithTime.length
    };
  };

  const timeAnalytics = calculateTimeAnalytics();

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  };

  const getTopTasksByTime = () => {
    return tasks
      .filter(task => task.timeSpent && task.timeSpent > 0)
      .sort((a, b) => (b.timeSpent || 0) - (a.timeSpent || 0))
      .slice(0, 5);
  };
  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Analytics
        </h1>
        <p className="text-muted-foreground">
          Detailed insights into your productivity and task management
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{totalTasks}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-success">{completionRate}%</p>
              </div>
              <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-orange-500">{currentStreak}</p>
              </div>
              <div className="h-12 w-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Best Streak</p>
                <p className="text-2xl font-bold text-purple-500">{longestStreak}</p>
              </div>
              <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Tracking Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Time Tracked</p>
                <p className="text-2xl font-bold text-focus">{formatTime(timeAnalytics.totalTimeSpent)}</p>
              </div>
              <div className="h-12 w-12 bg-focus/10 rounded-lg flex items-center justify-center">
                <Timer className="h-6 w-6 text-focus" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Time/Task</p>
                <p className="text-2xl font-bold text-break">{formatTime(timeAnalytics.averageTimePerTask)}</p>
              </div>
              <div className="h-12 w-12 bg-break/10 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-break" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Accuracy</p>
                <p className={cn(
                  "text-2xl font-bold",
                  timeAnalytics.timeAccuracy > 100 ? "text-break" : 
                  timeAnalytics.timeAccuracy > 80 ? "text-success" : "text-muted-foreground"
                )}>{timeAnalytics.timeAccuracy}%</p>
              </div>
              <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasks Tracked</p>
                <p className="text-2xl font-bold text-purple-500">{timeAnalytics.tasksWithTimeCount}</p>
              </div>
              <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Task Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Task Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-muted rounded-full"></div>
                <span className="text-sm">To Do</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{todoTasks}</span>
                <Badge variant="secondary">{totalTasks > 0 ? Math.round((todoTasks / totalTasks) * 100) : 0}%</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-focus rounded-full"></div>
                <span className="text-sm">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{inProgressTasks}</span>
                <Badge variant="secondary">{totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0}%</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{completedTasks}</span>
                <Badge variant="secondary">{completionRate}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-destructive rounded-full"></div>
                <span className="text-sm">High Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{highPriorityTasks}</span>
                <Badge variant="destructive">{totalTasks > 0 ? Math.round((highPriorityTasks / totalTasks) * 100) : 0}%</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-break rounded-full"></div>
                <span className="text-sm">Medium Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{mediumPriorityTasks}</span>
                <Badge variant="secondary">{totalTasks > 0 ? Math.round((mediumPriorityTasks / totalTasks) * 100) : 0}%</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-sm">Low Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{lowPriorityTasks}</span>
                <Badge variant="secondary">{totalTasks > 0 ? Math.round((lowPriorityTasks / totalTasks) * 100) : 0}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Tracking Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Time Consuming Tasks */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Top Time Consuming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getTopTasksByTime().length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Timer className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No time tracking data yet</p>
                <p className="text-xs">Start tracking time on your tasks to see insights</p>
              </div>
            ) : (
              <div className="space-y-3">
                {getTopTasksByTime().map((task, index) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center justify-center w-6 h-6 bg-primary/10 text-primary rounded-full text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={task.status === "completed" ? "secondary" : "outline"} className="text-xs">
                          {task.status}
                        </Badge>
                        <Badge variant={
                          task.priority === "high" ? "destructive" : 
                          task.priority === "medium" ? "default" : "secondary"
                        } className="text-xs">
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-focus">{formatTime(task.timeSpent || 0)}</p>
                      {task.estimatedTime && (
                        <p className="text-xs text-muted-foreground">
                          Est: {task.estimatedTime}m
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time Estimation Accuracy */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Time Estimation Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estimation Accuracy</span>
                <span className={cn(
                  "text-lg font-bold",
                  timeAnalytics.timeAccuracy > 100 ? "text-break" : 
                  timeAnalytics.timeAccuracy > 80 ? "text-success" : "text-muted-foreground"
                )}>
                  {timeAnalytics.timeAccuracy}%
                </span>
              </div>
              <Progress 
                value={Math.min(timeAnalytics.timeAccuracy, 100)} 
                className={cn(
                  "h-2",
                  timeAnalytics.timeAccuracy > 100 ? "[&>div]:bg-break" : "[&>div]:bg-success"
                )}
              />
              <p className="text-xs text-muted-foreground">
                {timeAnalytics.timeAccuracy > 100 
                  ? "You tend to underestimate task duration"
                  : timeAnalytics.timeAccuracy > 80
                  ? "Great estimation accuracy!"
                  : "Consider tracking more tasks for better insights"
                }
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-focus/5 rounded-lg border border-focus/20">
                <p className="text-xs text-muted-foreground">Avg Completion Time</p>
                <p className="text-lg font-bold text-focus">{formatTime(timeAnalytics.averageCompletionTime)}</p>
              </div>
              <div className="p-3 bg-success/5 rounded-lg border border-success/20">
                <p className="text-xs text-muted-foreground">Tasks Tracked</p>
                <p className="text-lg font-bold text-success">{timeAnalytics.tasksWithTimeCount}</p>
              </div>
            </div>

            {timeAnalytics.totalEstimatedTime > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated vs Actual</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <p className="text-muted-foreground">Estimated</p>
                    <p className="font-semibold">{formatTime(timeAnalytics.totalEstimatedTime)}</p>
                  </div>
                  <div className="text-center p-2 bg-focus/10 rounded">
                    <p className="text-muted-foreground">Actual</p>
                    <p className="font-semibold text-focus">{formatTime(timeAnalytics.totalTimeSpent)}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}