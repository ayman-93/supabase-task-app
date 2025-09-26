import { useState, useEffect } from "react";
import { TaskForm } from "./components/tasks/TaskForm";
import { TaskList } from "./components/tasks/TaskList";
import { SearchBar } from "./components/ui/SearchBar";
import { PreferencesPanel } from "./components/ui/PreferencesPanel";
import { Pagination } from "./components/ui/Pagination";
import { ThemeToggle } from "./components/ui/ThemeToggle";
import { AuthForm } from "./components/auth/AuthForm";
import { ProfilePage } from "./components/profile/ProfilePage";
import { useTasks } from "./hooks/useTasks";
import { useAuth } from "./hooks/useAuth";
import { useTheme } from "./hooks/useTheme";
import { useDebounce } from "./hooks/useDebounce";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { defaultPreferences } from "./types/preferences";
import type { UserPreferences } from "./types/preferences";
import "./styles/animations.css";

function App() {
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    login,
    signup,
    logout,
    loginWithGoogle,
    updateProfile,
    error: authError,
  } = useAuth();
  useTheme(); // Initialize theme management
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    "taskManagerPreferences",
    defaultPreferences
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showProfile, setShowProfile] = useState(false);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearchTerm,
    preferences.sortOrder,
    preferences.completionFilter,
  ]);

  // Pass search, sort, filter and pagination to useTasks hook
  const {
    tasks,
    isLoading,
    error,
    pagination,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
  } = useTasks({
    searchTerm: debouncedSearchTerm,
    sortOrder: preferences.sortOrder,
    completionFilter: preferences.completionFilter,
    page: currentPage,
    pageSize: pageSize,
    userId: user?.id,
  });

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <svg
              className="animate-spin h-12 w-12 text-blue-600 dark:text-blue-400"
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
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth form if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthForm
        onLogin={login}
        onSignup={signup}
        onGoogleLogin={loginWithGoogle}
        error={authError}
      />
    );
  }

  return (
    <div className="min-h-screen">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 dark:bg-yellow-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-100 dark:bg-green-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        {/* Header with user info */}
        <header className="mb-12">
          <div className="flex justify-between items-start">
            <div className="text-center flex-1">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl shadow-blue-500/25">
                <svg
                  className="w-10 h-10 text-white"
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
              </div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                Task Manager
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Shared Task Manager
              </p>
            </div>

            {/* User menu */}
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {user?.avatar_url && (
                <img
                  src={user.avatar_url}
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.displayName}
                </p>
                {user?.country && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.country}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <button
                  onClick={() => setShowProfile(true)}
                  className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                  title="Profile Settings"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Task Form - Sidebar on desktop */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <TaskForm onSubmit={addTask} />
            </div>
          </div>

          {/* Task List - Main content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search and Preferences Bar - New Layout */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <SearchBar
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClear={() => setSearchTerm("")}
                />
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
                <PreferencesPanel
                  preferences={preferences}
                  onPreferencesChange={setPreferences}
                />
              </div>
            </div>

            {/* Task List */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden lg:h-[calc(80vh-16rem)] flex flex-col">
              {error && (
                <div className="m-6 mb-0 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </p>
                </div>
              )}
              <div className="flex-1 p-6 pb-0 overflow-hidden">
                <TaskList
                  tasks={tasks}
                  onEdit={updateTask}
                  onDelete={deleteTask}
                  onToggle={toggleTask}
                  isLoading={isLoading}
                  searchTerm={debouncedSearchTerm}
                  viewDensity={preferences.viewDensity}
                />
              </div>
              {!isLoading && pagination.totalCount > 0 && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalCount={pagination.totalCount}
                  pageSize={pagination.pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfile && user && (
        <ProfilePage
          user={user}
          onUpdateProfile={updateProfile}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}

export default App;
