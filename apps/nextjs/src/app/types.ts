export interface Page {
  title: string;
  fakeUrl: string;
  prompt: string;
  content: string;
  id: string;
  userId: string;
  response: string;
  parentId: string;
  model: string | null;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  description: string | null;
  isPublic: boolean;
  isBookmarkDefaultPublic: boolean;
}
