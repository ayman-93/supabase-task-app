import type { TaskWithUser, TaskUpdate } from "../../types/task";
import type { ViewDensity } from "../../types/preferences";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  readonly tasks: TaskWithUser[];
  readonly onEdit: (id: number, updates: TaskUpdate) => Promise<void>;
  readonly onDelete: (id: number) => Promise<void>;
  readonly onToggle: (id: number, isCompleted: boolean) => Promise<void>;
  readonly isLoading?: boolean;
  readonly searchTerm?: string;
  readonly viewDensity?: ViewDensity;
}

export function TaskList({
  tasks,
  onEdit,
  onDelete,
  onToggle,
  isLoading,
  searchTerm = "",
  viewDensity = "comfortable",
}: TaskListProps) {
  const densityClasses = {
    compact: "gap-2",
    comfortable: "gap-4",
    spacious: "gap-6",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - Always visible */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          Your Tasks
        </h2>
        <div className="flex items-center gap-2">
          {isLoading && (
            <svg
              className="animate-spin h-4 w-4 text-blue-600 dark:text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Content area - Shows loading, empty states, or task list */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400">Loading tasks...</p>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          // Empty states
          searchTerm ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                <svg
                  className="w-8 h-8 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                No results found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No tasks match "{searchTerm}"
              </p>
            </div>
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-200 dark:bg-gray-700 rounded-full">
                <svg
                  className="w-8 h-8 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                No tasks yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Create your first task to get started!
              </p>
            </div>
          )
        ) : (
          // Task list
          <div className={`grid ${densityClasses[viewDensity]}`}>
            {tasks.map((task) => (
              <div
                key={task.id}
                className="animate-fade-in"
                style={{
                  animation: "fadeIn 0.3s ease-in-out",
                }}
              >
                <TaskItem task={task} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
