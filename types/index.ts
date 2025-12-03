export interface Post {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  authorId: string;
  authorName: string;
  imageUrl?: string;
  hugsCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  hugsCount: number;
  createdAt: Date;
}

export interface User {
  id: string;
  anonymousName: string;
  createdAt: Date;
}

export interface NewUser {
  anonymousName: string;
  createdAt: Date;
}

export interface Hug {
  id: string;
  targetId: string; // post veya comment id
  targetType: "post" | "comment";
  userId: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  order: number;
  isActive: boolean;
}
