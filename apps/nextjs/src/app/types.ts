export interface Page {
  title: string;
  fakeUrl: string;
  prompt: string;
  content: string;
  cacheKey: string;
  userId?: string;
  response?: string;
  parentId?: string;
}

export interface NavigationState {
  currentIndex: number;
  history: string[];
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  description: string | null;
  isPublic: boolean;
  isBookmarkDefaultPublic: boolean;
}
