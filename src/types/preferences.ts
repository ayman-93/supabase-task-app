export type SortOrder = "newest" | "oldest";
export type ViewDensity = "compact" | "comfortable" | "spacious";
export type CompletionFilter = "all" | "active" | "completed";

export interface UserPreferences {
  sortOrder: SortOrder;
  viewDensity: ViewDensity;
  completionFilter: CompletionFilter;
}

export const defaultPreferences: UserPreferences = {
  sortOrder: "newest",
  viewDensity: "comfortable",
  completionFilter: "all",
};