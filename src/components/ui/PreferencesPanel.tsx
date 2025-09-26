import type { UserPreferences, SortOrder, ViewDensity, CompletionFilter } from "../../types/preferences";

interface PreferencesPanelProps {
  readonly preferences: UserPreferences;
  readonly onPreferencesChange: (preferences: UserPreferences) => void;
}

export function PreferencesPanel({ preferences, onPreferencesChange }: PreferencesPanelProps) {
  const handleSortChange = (sortOrder: SortOrder) => {
    onPreferencesChange({ ...preferences, sortOrder });
  };

  const handleDensityChange = (viewDensity: ViewDensity) => {
    onPreferencesChange({ ...preferences, viewDensity });
  };

  const handleCompletionFilterChange = (completionFilter: CompletionFilter) => {
    onPreferencesChange({ ...preferences, completionFilter });
  };

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* Sort Order */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Sort:
        </label>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => handleSortChange("newest")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
              preferences.sortOrder === "newest"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => handleSortChange("oldest")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
              preferences.sortOrder === "oldest"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Oldest
          </button>
        </div>
      </div>

      {/* View Density */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          View:
        </label>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => handleDensityChange("compact")}
            className={`p-1.5 rounded-md transition-all ${
              preferences.viewDensity === "compact"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
            title="Compact view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => handleDensityChange("comfortable")}
            className={`p-1.5 rounded-md transition-all ${
              preferences.viewDensity === "comfortable"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
            title="Comfortable view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => handleDensityChange("spacious")}
            className={`p-1.5 rounded-md transition-all ${
              preferences.viewDensity === "spacious"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
            title="Spacious view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Completion Filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Show:
        </label>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => handleCompletionFilterChange("all")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
              preferences.completionFilter === "all"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleCompletionFilterChange("active")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
              preferences.completionFilter === "active"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => handleCompletionFilterChange("completed")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
              preferences.completionFilter === "completed"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Completed
          </button>
        </div>
      </div>
    </div>
  );
}