export interface Page {
  title: string;
  fakeUrl: string;
  prompt: string;
  content: string;
}

export interface NavigationState {
  currentIndex: number;
  history: string[];
  bookmarks: string[];
}
