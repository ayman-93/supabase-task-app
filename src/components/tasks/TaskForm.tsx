import { useState } from "react";
import type { FormEvent } from "react";
import type { TaskInsert } from "../../types/task";
import { Input } from "../ui/Input";
import { TextArea } from "../ui/TextArea";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface TaskFormProps {
  readonly onSubmit: (task: TaskInsert) => Promise<void>;
}

export function TaskForm({ onSubmit }: TaskFormProps) {
  const [task, setTask] = useState<TaskInsert>({
    title: "",
    description: "",
    isCompleted: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!task.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!task.description.trim()) {
      newErrors.description = "Description is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSubmit(task);
      setTask({ title: "", description: "", isCompleted: false });
      setErrors({});
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Task
          </h2>
        </div>

        <Input
          label="Title"
          placeholder="Enter task title"
          value={task.title}
          onChange={(e) => setTask({ ...task, title: e.target.value })}
          error={errors.title}
          required
        />

        <TextArea
          label="Description"
          placeholder="Enter task description"
          value={task.description}
          onChange={(e) => setTask({ ...task, description: e.target.value })}
          rows={3}
          error={errors.description}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          {isLoading ? "Adding Task..." : "Add Task"}
        </Button>
      </form>
    </Card>
  );
}
