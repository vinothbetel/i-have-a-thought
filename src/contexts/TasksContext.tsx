import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  doc,
  getDoc,
  query,
  orderBy,
  where,
  deleteField,
  setDoc,
  onSnapshot,
  Unsubscribe
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Task } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { notificationService } from "@/lib/notifications";
import { useSound } from "@/hooks/useSound";
import { TASK_COMPLETE_SOUND_URL } from "@/lib/utils";
import { UserProfile, Team } from "@/types";
import { useNotifications } from "@/contexts/NotificationsContext";

interface TasksContextType {
  tasks: Task[];
  teamMembers: UserProfile[];
  loading: boolean;
  isTaskFormActive: boolean;
  setTaskFormActive: (active: boolean) => void;
  addTask: (taskData: Omit<Task, "id" | "createdAt">) => Promise<void>;
  updateTask: (taskId: string, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskStatus: (taskId: string) => Promise<void>;
  toggleTaskPriority: (taskId: string) => Promise<void>;
  updateTaskTimeSpent: (taskId: string, timeToAdd: number) => Promise<void>;
  getTasksByDateRange: (startDate: Date, endDate: Date) => Task[];
  getTasksByStatus: (status: Task["status"]) => Task[];
  getTasksByPriority: (priority: Task["priority"]) => Task[];
  getTasksCompletedOnDate: (date: Date) => Task[];
  getTotalTasksCount: () => number;
  getCompletedTasksCount: () => number;
  getActiveTasksCount: () => number;
  getCurrentStreak: () => number;
  getLongestStreak: () => number;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksContextProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTaskFormActive, setIsTaskFormActive] = useState(false);
  const { user, userProfile } = useAuth();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const { playSound, preloadCommonSounds } = useSound();

  // CRITICAL FIX: Correctly handle listener cleanup to prevent memory leaks
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (user && userProfile) {
      unsubscribe = setupRealtimeListeners();
      preloadCommonSounds(); // Preload sounds when user logs in
    } else {
      setTasks([]);
      setTeamMembers([]);
      setLoading(false);
    }
    
    // This cleanup function will run when the component unmounts or dependencies change
    return () => {
      if (unsubscribe) {
        console.log("Cleaning up all real-time listeners.");
        unsubscribe();
      }
    };
  }, [user, userProfile, preloadCommonSounds]);

  const setupRealtimeListeners = () => {
    if (!user || !userProfile) return;

    setLoading(true);
    const unsubscribeFunctions: Unsubscribe[] = [];
    
    const personalTasksQuery = query(
      collection(db, 'users', user.uid, 'tasks'),
      orderBy('createdAt', 'desc')
    );
    
    const personalTasksUnsubscribe = onSnapshot(personalTasksQuery, (snapshot) => {
      const personalTasks: Task[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      
      setTasks(prevTasks => {
        const teamTasks = prevTasks.filter(task => task.teamId);
        const allTasks = [...personalTasks, ...teamTasks];
        return allTasks.sort((a, b) => {
          if (a.priority === "high" && b.priority !== "high") return -1;
          if (b.priority === "high" && a.priority !== "high") return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      });
      setLoading(false);
    }, (error) => {
      console.error("Error in personal tasks listener:", error);
      toast({ title: "Connection error", description: "Lost connection to personal tasks.", variant: "destructive" });
      setLoading(false);
    });
    unsubscribeFunctions.push(personalTasksUnsubscribe);
    
    if (userProfile.teamId) {
      const teamTasksQuery = query(
        collection(db, 'teams', userProfile.teamId, 'tasks'),
        where('assignedTo', 'array-contains', user.uid) // <-- ADD THIS LINE
      );
      
      const teamTasksUnsubscribe = onSnapshot(teamTasksQuery, (snapshot) => {
        const teamTasks: Task[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        
        setTasks(prevTasks => {
          const personalTasks = prevTasks.filter(task => !task.teamId);
          const allTasks = [...personalTasks, ...teamTasks];
          return allTasks.sort((a, b) => {
            if (a.priority === "high" && b.priority !== "high") return -1;
            if (b.priority === "high" && a.priority !== "high") return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
        });
      }, (error) => {
        console.error("Error in team tasks listener:", error);
        toast({ title: "Team connection error", description: "Lost connection to team tasks.", variant: "destructive" });
      });
      unsubscribeFunctions.push(teamTasksUnsubscribe);

      const teamDocRef = doc(db, 'teams', userProfile.teamId);
      const teamMembersUnsubscribe = onSnapshot(teamDocRef, async (teamDoc) => {
        if (teamDoc.exists()) {
          const teamData = teamDoc.data() as Team;
          const memberUids = teamData.memberIds || [];
          if (memberUids.length > 0) {
            const memberDocsPromises = memberUids.map(uid => getDoc(doc(db, 'users', uid)));
            const memberDocsSnaps = await Promise.all(memberDocsPromises);
            const fetchedMembers = memberDocsSnaps.filter(snap => snap.exists()).map(snap => snap.data() as UserProfile);
            setTeamMembers(fetchedMembers);
          } else {
            setTeamMembers([]);
          }
        } else {
          setTeamMembers([]);
        }
      }, (error) => {
        console.error("Error in team members listener:", error);
        setTeamMembers([]);
      });
      unsubscribeFunctions.push(teamMembersUnsubscribe);
    } else {
      setTeamMembers([]);
    }
    
    // Return a single function that unsubscribes from all listeners
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  };

  const addTask = async (taskData: Omit<Task, "id" | "createdAt">) => {
    if (!user || !userProfile) return;

    const tempId = `temp-${Date.now()}`;
    const isTeamTask = !!(userProfile.teamId && taskData.assignedTo && taskData.assignedTo.length > 0);
    
    const newTask: Task = {
      ...taskData,
      id: tempId,
      assignedTo: taskData.assignedTo || [],
      teamId: isTeamTask ? userProfile.teamId : undefined,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      status: 'todo',
      priority: taskData.priority || 'medium',
    };

    setTasks(prev => [newTask, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    toast({ title: "Task created", description: "Your task is being saved..." });

    try {
      const { id, ...firestoreData } = newTask;
      if (!firestoreData.teamId) delete firestoreData.teamId;

      const collectionPath = isTeamTask ? `teams/${userProfile.teamId}/tasks` : `users/${user.uid}/tasks`;
      const docRef = await addDoc(collection(db, collectionPath), firestoreData);
      
      const finalTask = { ...newTask, id: docRef.id };
      setTasks(prev => prev.map(task => (task.id === tempId ? finalTask : task)));

      if (finalTask.dueDate) {
        notificationService.scheduleTaskReminder(finalTask, 15);
        notificationService.scheduleTaskDueNotification(finalTask);
      }

      // Send notifications to assigned users upon task creation
      if (finalTask.assignedTo && finalTask.assignedTo.length > 0) {
        const assignerName = userProfile.displayName || user.email || 'Someone';
        for (const assignedUserId of finalTask.assignedTo) {
          if (assignedUserId !== user.uid) {
            console.log('Sending task assignment notification to user:', assignedUserId);
            notificationService.handleTaskAssignment(finalTask, assignerName, assignedUserId);
          }
        }
      }
    } catch (error) {
      setTasks(prev => prev.filter(task => task.id !== tempId));
      console.error("Error adding task:", error);
      toast({ title: "Failed to create task", variant: "destructive" });
    }
  };

  const updateTask = async (taskId: string, taskData: Partial<Task>) => {
    if (!user || !userProfile) {
      toast({ title: "Authentication required", variant: "destructive" });
      return;
    }

    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) {
      toast({ title: "Task not found", variant: "destructive" });
      return;
    }

    const originalAssignedTo = taskToUpdate.assignedTo || [];
    const newAssignedTo = taskData.assignedTo || originalAssignedTo;
    
    const shouldBeTeamTask = !!(userProfile.teamId && newAssignedTo.length > 0);
    const targetTeamId = shouldBeTeamTask ? userProfile.teamId : null;
    const movingCollections = (taskToUpdate.teamId || null) !== targetTeamId;

    const updatedTaskForState = { ...taskToUpdate, ...taskData, teamId: targetTeamId || undefined };
    if (!updatedTaskForState.teamId) delete updatedTaskForState.teamId;

    // Perform optimistic UI update first
    setTasks(prev => prev.map(t => (t.id === taskId ? updatedTaskForState : t)));

    try {
      // Handle notifications for newly assigned users
      const newlyAssignedUsers = newAssignedTo.filter(userId => !originalAssignedTo.includes(userId));
      if (newlyAssignedUsers.length > 0) {
        const assignerName = userProfile.displayName || user.email || 'Someone';
        
        for (const assignedUserId of newlyAssignedUsers) {
          if (assignedUserId !== user.uid) {
            console.log('Sending task assignment notification to user:', assignedUserId);
            notificationService.handleTaskAssignment(updatedTaskForState, assignerName, assignedUserId);
          }
        }
      }

      // Persist changes to Firestore
      const cleanedTaskData: any = { ...taskData };
      Object.entries(cleanedTaskData).forEach(([key, value]) => {
        if (value === undefined) cleanedTaskData[key] = deleteField();
      });
      cleanedTaskData.teamId = targetTeamId || deleteField();
      
      if (movingCollections) {
        const currentTaskRef = doc(db, taskToUpdate.teamId ? `teams/${taskToUpdate.teamId}/tasks` : `users/${user.uid}/tasks`, taskId);
        await deleteDoc(currentTaskRef);

        const newTaskRef = doc(db, targetTeamId ? `teams/${targetTeamId}/tasks` : `users/${user.uid}/tasks`, taskId);
        const { id, ...dataForFirestore } = updatedTaskForState;
        
        // Clean undefined values for setDoc
        const cleanedData: any = {};
        Object.entries(dataForFirestore).forEach(([key, value]) => {
          if (value !== undefined) {
            cleanedData[key] = value;
          }
        });
        
        await setDoc(newTaskRef, cleanedData);
      } else {
        const taskRef = doc(db, taskToUpdate.teamId ? `teams/${taskToUpdate.teamId}/tasks` : `users/${user.uid}/tasks`, taskId);
        await updateDoc(taskRef, cleanedTaskData);
      }

      toast({ title: "Task updated", description: "Your changes have been saved." });
    } catch (error) {
      // Rollback on failure
      setTasks(prev => prev.map(t => (t.id === taskId ? taskToUpdate : t)));
      console.error("Error updating task:", error);
      toast({ title: "Failed to update task", variant: "destructive" });
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    setTasks(prev => prev.filter(task => task.id !== taskId));

    try {
      const taskRefPath = taskToDelete.teamId ? `teams/${taskToDelete.teamId}/tasks/${taskId}` : `users/${user.uid}/tasks/${taskId}`;
      await deleteDoc(doc(db, taskRefPath));
      
      notificationService.clearScheduledNotification(`task-reminder-${taskId}`);
      notificationService.clearScheduledNotification(`task-due-${taskId}`);
      
      toast({ title: "Task deleted", variant: "destructive" });
    } catch (error) {
      setTasks(prev => [...prev, taskToDelete]);
      console.error("Error deleting task:", error);
      toast({ title: "Failed to delete task", variant: "destructive" });
    }
  };

  const toggleTaskStatus = async (taskId: string) => {
    if (!user) return;
    const taskToToggle = tasks.find(t => t.id === taskId);
    if (!taskToToggle) return;

    const originalTask = { ...taskToToggle };
    const newStatus: Task["status"] = taskToToggle.status === "completed" ? "todo" : "completed";

    const updatedTaskForState = { ...taskToToggle, status: newStatus };
    if (newStatus === "completed") {
      updatedTaskForState.completedAt = new Date().toISOString();
    } else {
      delete updatedTaskForState.completedAt;
    }

    setTasks(prev => prev.map(t => (t.id === taskId ? updatedTaskForState : t)));

    try {
      if (newStatus === "completed") {
        // Play sound immediately for instant feedback
        playSound(TASK_COMPLETE_SOUND_URL);
        notificationService.showTaskCompleteNotification(taskToToggle.title);
        // Use the global notification function to avoid duplicates
        await notificationService.addInAppNotification(
          user.uid,
          "Task completed! 🎯",
          `Great job completing "${taskToToggle.title}"!`,
          'task-complete',
          { taskId, taskTitle: taskToToggle.title }
        );
      }

      const taskRefPath = taskToToggle.teamId ? `teams/${taskToToggle.teamId}/tasks/${taskId}` : `users/${user.uid}/tasks/${taskId}`;
      const updateData: any = { 
        status: newStatus, 
        completedAt: newStatus === 'completed' ? updatedTaskForState.completedAt : deleteField() 
      };
      await updateDoc(doc(db, taskRefPath), updateData);
    } catch (error) {
      setTasks(prev => prev.map(t => (t.id === taskId ? originalTask : t)));
      console.error("Error toggling task status:", error);
      toast({ title: "Failed to update task", variant: "destructive" });
    }
  };

  const toggleTaskPriority = async (taskId: string) => {
    if (!user) return;
    const taskToToggle = tasks.find(t => t.id === taskId);
    if (!taskToToggle) return;

    const newPriority = taskToToggle.priority === "high" ? "medium" : "high";
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, priority: newPriority } : t)));

    try {
      const taskRefPath = taskToToggle.teamId ? `teams/${taskToToggle.teamId}/tasks/${taskId}` : `users/${user.uid}/tasks/${taskId}`;
      await updateDoc(doc(db, taskRefPath), { priority: newPriority });
    } catch (error) {
      setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, priority: taskToToggle.priority } : t)));
      console.error("Error toggling task priority:", error);
      toast({ title: "Failed to update priority", variant: "destructive" });
    }
  };

  const updateTaskTimeSpent = async (taskId: string, timeToAdd: number) => {
    if (!user) return;
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;

    const originalTask = { ...taskToUpdate };
    const newTimeSpent = (taskToUpdate.timeSpent || 0) + timeToAdd;
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, timeSpent: newTimeSpent } : t)));

    try {
      const taskRefPath = taskToUpdate.teamId ? `teams/${taskToUpdate.teamId}/tasks/${taskId}` : `users/${user.uid}/tasks/${taskId}`;
      await updateDoc(doc(db, taskRefPath), { timeSpent: newTimeSpent });
    } catch (error) {
      setTasks(prev => prev.map(t => (t.id === taskId ? originalTask : t)));
      console.error("Error updating task time:", error);
      throw error;
    }
  };

  const getTasksByDateRange = (startDate: Date, endDate: Date): Task[] => tasks.filter(task => {
    const taskDate = new Date(task.createdAt);
    return taskDate >= startDate && taskDate <= endDate;
  });

  const getTasksByStatus = (status: Task["status"]): Task[] => tasks.filter(task => task.status === status);
  const getTasksByPriority = (priority: Task["priority"]): Task[] => tasks.filter(task => task.priority === priority);

  const getTasksCompletedOnDate = (date: Date): Task[] => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return tasks.filter(task => {
      if (task.status !== "completed" || !task.completedAt) return false;
      const taskDate = new Date(task.completedAt);
      return taskDate >= startOfDay && taskDate <= endOfDay;
    });
  };

  const getTotalTasksCount = (): number => tasks.length;
  const getCompletedTasksCount = (): number => tasks.filter(task => task.status === "completed").length;
  const getActiveTasksCount = (): number => tasks.filter(task => task.status !== "completed").length;

  const getCurrentStreak = (): number => {
    if (tasks.length === 0) return 0;
    let streak = 0;
    let currentDate = new Date();
    while (getTasksCompletedOnDate(currentDate).length > 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    return streak;
  };

  const getLongestStreak = (): number => {
    if (tasks.length === 0) return 0;
    const completedDates = [...new Set(tasks.filter(t => t.status === 'completed' && t.completedAt).map(t => new Date(t.completedAt!).setHours(0, 0, 0, 0)))].sort((a,b) => a - b);
    if (completedDates.length === 0) return 0;
    
    let longestStreak = 0;
    let currentStreak = 0;
    if (completedDates.length > 0) {
        longestStreak = 1;
        currentStreak = 1;
    }

    for (let i = 1; i < completedDates.length; i++) {
        const dayInMillis = 86400000;
        if (completedDates[i] - completedDates[i - 1] === dayInMillis) {
            currentStreak++;
        } else {
            longestStreak = Math.max(longestStreak, currentStreak);
            currentStreak = 1;
        }
    }
    return Math.max(longestStreak, currentStreak);
  };
  
  const value = {
    tasks,
    teamMembers,
    loading,
    isTaskFormActive,
    setTaskFormActive: setIsTaskFormActive,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    toggleTaskPriority,
    updateTaskTimeSpent,
    getTasksByDateRange,
    getTasksByStatus,
    getTasksByPriority,
    getTasksCompletedOnDate,
    getTotalTasksCount,
    getCompletedTasksCount,
    getActiveTasksCount,
    getCurrentStreak,
    getLongestStreak,
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TasksContextProvider");
  }
  return context;
}