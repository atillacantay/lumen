import { db } from "@/config/firebase";
import { Post } from "@/types";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentSnapshot,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

const POSTS_COLLECTION = "posts";
const HUGS_COLLECTION = "hugs";
const PAGE_SIZE = 20;

export interface CreatePostInput {
  title: string;
  content: string;
  categoryId: string;
  authorId: string;
  authorName: string;
  imageUrl?: string;
}

export interface GetPostsResponse {
  posts: Post[];
  lastDoc: DocumentSnapshot | null;
}

const convertToPost = (docSnap: DocumentSnapshot): Post => {
  const data = docSnap.data()!;
  return {
    id: docSnap.id,
    title: data.title,
    content: data.content,
    categoryId: data.categoryId,
    authorId: data.authorId,
    authorName: data.authorName,
    imageUrl: data.imageUrl,
    hugsCount: data.hugsCount || 0,
    commentsCount: data.commentsCount || 0,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

export const createPost = async (input: CreatePostInput): Promise<Post> => {
  const now = Timestamp.now();

  const postData = {
    title: input.title,
    content: input.content,
    categoryId: input.categoryId,
    authorId: input.authorId,
    authorName: input.authorName,
    imageUrl: input.imageUrl ?? null,
    hugsCount: 0,
    commentsCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, POSTS_COLLECTION), postData);

  return {
    id: docRef.id,
    ...input,
    imageUrl: input.imageUrl,
    hugsCount: 0,
    commentsCount: 0,
    createdAt: now.toDate(),
    updatedAt: now.toDate(),
  };
};

export type SortOption = "newest" | "popular" | "mostComments";

const SORT_FIELDS: Record<SortOption, string> = {
  newest: "createdAt",
  popular: "hugsCount",
  mostComments: "commentsCount",
};

export const getPosts = async (
  lastDoc?: DocumentSnapshot | null,
  categoryId?: string,
  sortBy: SortOption = "newest",
  pageSize: number = PAGE_SIZE
): Promise<GetPostsResponse> => {
  const sortField = SORT_FIELDS[sortBy];

  let q = query(
    collection(db, POSTS_COLLECTION),
    orderBy(sortField, "desc"),
    limit(pageSize)
  );

  if (categoryId) {
    q = query(
      collection(db, POSTS_COLLECTION),
      where("categoryId", "==", categoryId),
      orderBy(sortField, "desc"),
      limit(pageSize)
    );
  }

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map(convertToPost);
  const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { posts, lastDoc: newLastDoc };
};

export const getPostById = async (postId: string): Promise<Post | null> => {
  const docRef = doc(db, POSTS_COLLECTION, postId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return convertToPost(docSnap);
  }
  return null;
};

export const getPostsByUser = async (userId: string): Promise<Post[]> => {
  const q = query(
    collection(db, POSTS_COLLECTION),
    where("authorId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(convertToPost);
};

export const toggleHug = async (
  postId: string,
  userId: string
): Promise<boolean> => {
  const hugId = `${userId}_${postId}`;
  const hugRef = doc(db, HUGS_COLLECTION, hugId);
  const hugSnap = await getDoc(hugRef);
  const postRef = doc(db, POSTS_COLLECTION, postId);

  if (hugSnap.exists()) {
    await deleteDoc(hugRef);
    await updateDoc(postRef, { hugsCount: increment(-1) });
    return false;
  } else {
    await setDoc(hugRef, {
      targetId: postId,
      targetType: "post",
      userId,
      createdAt: Timestamp.now(),
    });
    await updateDoc(postRef, { hugsCount: increment(1) });
    return true;
  }
};

export const hasUserHugged = async (
  postId: string,
  userId: string
): Promise<boolean> => {
  const hugId = `${userId}_${postId}`;
  const hugRef = doc(db, HUGS_COLLECTION, hugId);
  const hugSnap = await getDoc(hugRef);
  return hugSnap.exists();
};
