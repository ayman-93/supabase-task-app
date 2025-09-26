import { useState } from "react";
import type { TaskWithUser, TaskUpdate } from "../../types/task";
import { Input } from "../ui/Input";
import { TextArea } from "../ui/TextArea";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface TaskItemProps {
  readonly task: TaskWithUser;
  readonly onEdit: (id: number, updates: TaskUpdate) => Promise<void>;
  readonly onDelete: (id: number) => Promise<void>;
  readonly onToggle: (id: number, isCompleted: boolean) => Promise<void>;
}

export function TaskItem({ task, onEdit, onDelete, onToggle }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<TaskUpdate>({
    title: task.title || "",
    description: task.description || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    if (!editForm.title?.trim() || !editForm.description?.trim()) return;

    setIsLoading(true);
    try {
      if (task.id !== null) {
        await onEdit(task.id, editForm);
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    setIsDeleting(true);
    try {
      if (task.id !== null) {
        await onDelete(task.id);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      title: task.title || "",
      description: task.description || "",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card
      className={`${
        isDeleting ? "opacity-50 scale-95" : ""
      } transition-all duration-300`}
    >
      {isEditing ? (
        <div className="space-y-4">
          <Input
            value={editForm.title || ""}
            onChange={(e) =>
              setEditForm({ ...editForm, title: e.target.value })
            }
            placeholder="Task title"
          />
          <TextArea
            value={editForm.description || ""}
            onChange={(e) =>
              setEditForm({ ...editForm, description: e.target.value })
            }
            placeholder="Task description"
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              variant="success"
              size="sm"
              isLoading={isLoading}
            >
              Save
            </Button>
            <Button
              onClick={handleCancel}
              variant="ghost"
              size="sm"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="group">
          <div className="flex items-start gap-3 mb-2">
            <button
              onClick={() => task.id !== null && onToggle(task.id, task.isCompleted === true)}
              className="mt-1 flex-shrink-0"
            >
              <div className={`w-5 h-5 rounded border-2 transition-all ${
                task.isCompleted
                  ? "bg-green-600 border-green-600 dark:bg-green-500 dark:border-green-500"
                  : "border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400"
              }`}>
                {task.isCompleted && (
                  <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
            <div className="flex-1">
              <h3 className={`text-xl font-semibold ${
                task.isCompleted
                  ? "text-gray-500 dark:text-gray-500 line-through"
                  : "text-gray-900 dark:text-white"
              }`}>
                {task.title}
              </h3>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Edit"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Delete"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
          <p className={`mb-3 whitespace-pre-wrap ml-8 ${
            task.isCompleted
              ? "text-gray-400 dark:text-gray-600 line-through"
              : "text-gray-600 dark:text-gray-300"
          }`}>
            {task.description}
          </p>
          <div className="ml-8 mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Created by: {task.creator_first_name && task.creator_last_name
                ? `${task.creator_first_name} ${task.creator_last_name}`
                : task.creator_email || "Unknown User"}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              {formatDate(task.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
              ID: {task.id}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
