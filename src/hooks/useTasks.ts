import { useState, useEffect, useCallback } from "react";
import supabase from "../supabase-client";
import type { Task, TaskInsert, TaskUpdate, TaskWithUser } from "../types/task";
import type { SortOrder, CompletionFilter } from "../types/preferences";
import { REALTIME_LISTEN_TYPES, REALTIME_POSTGRES_CHANGES_LISTEN_EVENT, type RealtimePostgresDeletePayload, type RealtimePostgresInsertPayload, type RealtimePostgresUpdatePayload } from "@supabase/supabase-js";

interface UseTasksOptions {
  userId?: string;
  searchTerm?: string;
  sortOrder?: SortOrder;
  completionFilter?: CompletionFilter;
  page?: number;
  pageSize?: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function useTasks({
  userId,
  searchTerm = "",
  sortOrder = "newest",
  completionFilter = "all",
  page = 1,
  pageSize = 10
}: UseTasksOptions = {}) {
  const [tasks, setTasks] = useState<TaskWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: page,
    totalPages: 1,
    totalCount: 0,
    pageSize: pageSize,
    hasNextPage: false,
    hasPrevPage: false
  });

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First, get the total count to validate pagination
      let countQuery = supabase.from("tasks_with_user").select("*", { count: 'exact', head: true });

      // Apply filters for count query
      if (completionFilter === "active") {
        countQuery = countQuery.eq("isCompleted", false);
      } else if (completionFilter === "completed") {
        countQuery = countQuery.eq("isCompleted", true);
      }

      if (searchTerm.trim()) {
        countQuery = countQuery.or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
        );
      }

      const { count: totalCount, error: countError } = await countQuery;
      if (countError) throw countError;

      const total = totalCount || 0;
      const totalPages = Math.ceil(total / pageSize) || 1;

      // Validate and adjust current page if necessary
      const validPage = Math.min(page, totalPages);
      const actualPage = Math.max(1, validPage);

      // Now fetch the actual data with the valid page
      let dataQuery = supabase.from("tasks_with_user").select("*");

      // Apply the same filters
      if (completionFilter === "active") {
        dataQuery = dataQuery.eq("isCompleted", false);
      } else if (completionFilter === "completed") {
        dataQuery = dataQuery.eq("isCompleted", true);
      }

      if (searchTerm.trim()) {
        dataQuery = dataQuery.or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
        );
      }

      // Apply sort
      dataQuery = dataQuery.order("created_at", { ascending: sortOrder === "oldest" });

      // Apply pagination with validated page
      const from = (actualPage - 1) * pageSize;
      const to = from + pageSize - 1;
      dataQuery = dataQuery.range(from, to);

      const { data, error } = await dataQuery;

      if (error) throw error;

      if (data) {
        setTasks(data);

        // Update pagination info with the validated page
        setPagination({
          currentPage: actualPage,
          totalPages,
          totalCount: total,
          pageSize,
          hasNextPage: actualPage < totalPages,
          hasPrevPage: actualPage > 1
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch tasks";
      setError(errorMessage);
      console.error("Error fetching tasks:", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, sortOrder, completionFilter, page, pageSize]);

  const addTask = useCallback(async (newTask: Omit<TaskInsert, 'createdBy'>) => {
    try {
      setError(null);
      const { error } = await supabase
        .from("tasks")
        .insert({...newTask, createdBy: userId!})
        .select()
        .single();

      if (error) throw error;

      // Don't add to local state here - let the realtime subscription handle it
      // This prevents duplicate entries
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add task";
      setError(errorMessage);
      console.error("Error adding task:", err);
      throw err;
    }
  }, [userId]);

  const updateTask = useCallback(async (id: number, updates: TaskUpdate) => {
    try {
      setError(null);

      // Store original task for rollback
      const originalTask = tasks.find(t => t.id === id);
      if (!originalTask) throw new Error("Task not found");

      // Optimistic update
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? { ...task, ...updates } : task
        )
      );

      // Update on server
      const { error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id);

      if (error) {
        // Revert on error
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === id ? originalTask : task
          )
        );
        throw error;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update task";
      setError(errorMessage);
      console.error("Error updating task:", err);
      throw err;
    }
  }, [tasks]);

  const deleteTask = useCallback(async (id: number) => {
    try {
      setError(null);

      // Store task for rollback
      const taskToDelete = tasks.find(t => t.id === id);
      if (!taskToDelete) throw new Error("Task not found");

      // Optimistic update - remove from local state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));

      // Delete on server
      const { error } = await supabase.from("tasks").delete().eq("id", id);

      if (error) {
        // Revert on error - add task back
        setTasks(prevTasks => [...prevTasks, taskToDelete]);
        throw error;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete task";
      setError(errorMessage);
      console.error("Error deleting task:", err);
      throw err;
    }
  }, [tasks]);

  const toggleTask = useCallback(async (id: number, isCompleted: boolean) => {
    try {
      setError(null);

      // Optimistic update - immediately update local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? { ...task, isCompleted: !isCompleted } : task
        )
      );

      // Update on server
      const { error } = await supabase
        .from("tasks")
        .update({ isCompleted: !isCompleted })
        .eq("id", id);

      if (error) {
        // Revert optimistic update on error
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === id ? { ...task, isCompleted: isCompleted } : task
          )
        );
        throw error;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to toggle task";
      setError(errorMessage);
      console.error("Error toggling task:", err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle realtime INSERT events
  const handleRealtimeInsert = useCallback(async (payload: RealtimePostgresInsertPayload<Task>) => {
    // Fetch the task with user info from the view
    const { data: taskWithUser } = await supabase
      .from("tasks_with_user")
      .select("*")
      .eq("id", payload.new.id)
      .single();

    if (!taskWithUser) return;
    const newTask = taskWithUser;

    // Check if task matches current filters
    if (completionFilter === "active" && newTask.isCompleted === true) return;
    if (completionFilter === "completed" && newTask.isCompleted !== true) return;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (newTask.title?.toLowerCase().includes(searchLower) || false) ||
        (newTask.description?.toLowerCase().includes(searchLower) || false);
      if (!matchesSearch) return;
    }

    // Add to local state with correct sorting
    setTasks(prevTasks => {
      // Check if task already exists to prevent duplicates
      if (newTask.id && prevTasks.some(task => task.id === newTask.id)) {
        return prevTasks;
      }

      const updatedTasks = sortOrder === "newest"
        ? [newTask, ...prevTasks]
        : [...prevTasks, newTask];

      // Keep only items for current page
      const from = (page - 1) * pageSize;
      const to = from + pageSize;
      return updatedTasks.slice(from, to);
    });

    // Update pagination count
    setPagination(prev => ({
      ...prev,
      totalCount: prev.totalCount + 1,
      totalPages: Math.ceil((prev.totalCount + 1) / prev.pageSize)
    }));
  }, [completionFilter, searchTerm, sortOrder, page, pageSize]);

  // Handle realtime UPDATE events
  const handleRealtimeUpdate = useCallback(async (payload: RealtimePostgresUpdatePayload<Task>) => {
    const taskId = payload.new.id;

    // Fetch the updated task with user info from the view
    const { data: taskWithUser } = await supabase
      .from("tasks_with_user")
      .select("*")
      .eq("id", taskId)
      .single();

    if (!taskWithUser) return;
    const updatedTask = taskWithUser;

    // Check if updated task still matches filters
    let shouldRemove =
      (completionFilter === "active" && updatedTask.isCompleted === true) ||
      (completionFilter === "completed" && updatedTask.isCompleted === false);

    // Also check search filter if not already removing
    if (!shouldRemove && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (updatedTask.title?.toLowerCase().includes(searchLower) || false) ||
        (updatedTask.description?.toLowerCase().includes(searchLower) || false);
      shouldRemove = !matchesSearch;
    }

    setTasks(prevTasks => {
      if (shouldRemove) {
        // Remove task if it no longer matches filters
        const filtered = prevTasks.filter(task => task.id !== taskId);

        // Update pagination if task was removed
        setPagination(prev => ({
          ...prev,
          totalCount: Math.max(0, prev.totalCount - 1),
          totalPages: Math.ceil(Math.max(0, prev.totalCount - 1) / prev.pageSize)
        }));

        return filtered;
      } else {
        // Update the task in place
        return prevTasks.map(task =>
          task.id === taskId ? updatedTask : task
        );
      }
    });
  }, [completionFilter, searchTerm]);

  // Handle realtime DELETE events
  const handleRealtimeDelete = useCallback((payload: RealtimePostgresDeletePayload<Task>) => {
    const deletedTaskId = payload.old.id;

    setTasks(prevTasks =>
      prevTasks.filter(task => task.id !== deletedTaskId)
    );

    // Update pagination count
    setPagination(prev => ({
      ...prev,
      totalCount: Math.max(0, prev.totalCount - 1),
      totalPages: Math.ceil(Math.max(0, prev.totalCount - 1) / prev.pageSize)
    }));
  }, []);

  useEffect(() => {
    const channel = supabase.channel(`tasks-channel`);

      channel.on<Task>(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        {
          event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT,
          schema: 'public',
          table: 'tasks'
        },
        handleRealtimeInsert
      );

      channel.on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        {
          event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE,
          schema: 'public',
          table: 'tasks'
        },
        handleRealtimeUpdate
      );

      channel.on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        {
          event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.DELETE,
          schema: 'public',
          table: 'tasks'
        },
        handleRealtimeDelete
      );

      channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleRealtimeInsert, handleRealtimeUpdate, handleRealtimeDelete]);

  
  return {
    tasks,
    isLoading,
    error,
    pagination,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    refetch: fetchTasks,
  };
}