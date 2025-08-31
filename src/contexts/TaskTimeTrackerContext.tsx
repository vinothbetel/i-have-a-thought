import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Task } from "@/types";
import { useTasks } from "@/contexts/TasksContext";
import { useToast } from "@/hooks/use-toast";

interface TaskTimeTrackerContextType {
  trackingTask: Task | null;
  currentSessionElapsedSeconds: number;
  isTracking: boolean;
  startTracking: (task: Task) => void;
  pauseTracking: () => void;
  resumeTracking: () => void;
  stopTracking: () => void;
  getFormattedTime: (seconds: number) => string;
}

const TaskTimeTrackerContext = createContext<TaskTimeTrackerContextType | undefined>(undefined);

export function TaskTimeTrackerProvider({ children }: { children: ReactNode }) {
  const [trackingTask, setTrackingTask] = useState<Task | null>(null);
  const [currentSessionElapsedSeconds, setCurrentSessionElapsedSeconds] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const { updateTaskTimeSpent } = useTasks();
  const { toast } = useToast();

  // Timer effect - increments elapsed seconds when tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTracking && trackingTask) {
      interval = setInterval(() => {
        setCurrentSessionElapsedSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTracking, trackingTask]);

  const startTracking = (task: Task) => {
    // If already tracking a different task, stop it first
    if (trackingTask && trackingTask.id !== task.id) {
      stopTracking();
    }

    setTrackingTask(task);
    setCurrentSessionElapsedSeconds(0);
    setIsTracking(true);
    
    toast({
      title: "Time tracking started ⏱️",
      description: `Now tracking time for "${task.title}"`,
    });
  };

  const pauseTracking = () => {
    if (!trackingTask) return;
    
    setIsTracking(false);
    
    toast({
      title: "Time tracking paused ⏸️",
      description: `Paused tracking for "${trackingTask.title}"`,
    });
  };

  const resumeTracking = () => {
    if (!trackingTask) return;
    
    setIsTracking(true);
    
    toast({
      title: "Time tracking resumed ▶️",
      description: `Resumed tracking for "${trackingTask.title}"`,
    });
  };

  const stopTracking = async () => {
    if (!trackingTask || currentSessionElapsedSeconds === 0) {
      // Reset state even if no time to save
      setTrackingTask(null);
      setCurrentSessionElapsedSeconds(0);
      setIsTracking(false);
      return;
    }

    try {
      // Save the elapsed time to the task
      await updateTaskTimeSpent(trackingTask.id, currentSessionElapsedSeconds);
      
      const formattedTime = getFormattedTime(currentSessionElapsedSeconds);
      
      toast({
        title: "Time tracking stopped ⏹️",
        description: `Saved ${formattedTime} for "${trackingTask.title}"`,
      });
    } catch (error) {
      console.error("Error saving time tracking data:", error);
      toast({
        title: "Failed to save time",
        description: "Could not save the tracked time. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset state regardless of save success/failure
      setTrackingTask(null);
      setCurrentSessionElapsedSeconds(0);
      setIsTracking(false);
    }
  };

  const getFormattedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const value = {
    trackingTask,
    currentSessionElapsedSeconds,
    isTracking,
    startTracking,
    pauseTracking,
    resumeTracking,
    stopTracking,
    getFormattedTime,
  };

  return (
    <TaskTimeTrackerContext.Provider value={value}>
      {children}
    </TaskTimeTrackerContext.Provider>
  );
}

export function useTaskTimeTracker() {
  const context = useContext(TaskTimeTrackerContext);
  if (context === undefined) {
    throw new Error("useTaskTimeTracker must be used within a TaskTimeTrackerProvider");
  }
  return context;
}