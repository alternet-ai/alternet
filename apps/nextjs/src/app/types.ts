export interface HistoryEntry {
  title: string;
  prompt: string;
  cacheKey: string;
}

export interface NavigationState {
  currentIndex: number;
  history: HistoryEntry[];
  bookmarks: string[];
}
