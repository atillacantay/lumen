import { db } from "@/config/firebase";
import { notifyPostHug } from "@/services/notification-service";
import { Post, TimeRange } from "@/types";
import { sanitizePostInput } from "@/utils/sanitize";
import { getTimeRangeThreshold } from "@/utils/time-range";
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

// Get all post IDs that user has hugged - single query instead of N queries
const getUserHuggedPostIds = async (userId?: string): Promise<Set<string>> => {
  if (!userId) return new Set();

  const q = query(
    collection(db, HUGS_COLLECTION),
    where("userId", "==", userId),
    where("targetType", "==", "post")
  );

  const snapshot = await getDocs(q);
  return new Set(snapshot.docs.map((doc) => doc.data().targetId));
};

// Filter hugged posts from a set of post IDs
const filterHuggedPosts = (
  postIds: string[],
  userHuggedIds: Set<string>
): Set<string> => {
  return new Set(postIds.filter((id) => userHuggedIds.has(id)));
};

const convertToPost = (docSnap: DocumentSnapshot, isHugged = false): Post => {
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
    isHugged,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

export const createPost = async (input: CreatePostInput): Promise<Post> => {
  // Sanitize input to prevent XSS and invalid data
  const sanitized = sanitizePostInput({
    title: input.title,
    content: input.content,
    categoryId: input.categoryId,
    authorName: input.authorName,
    imageUrl: input.imageUrl,
  });

  if (!sanitized) {
    throw new Error("Invalid post data");
  }

  const now = Timestamp.now();

  const postData = {
    title: sanitized.title,
    content: sanitized.content,
    categoryId: sanitized.categoryId,
    authorId: input.authorId,
    authorName: sanitized.authorName,
    imageUrl: sanitized.imageUrl ?? null,
    hugsCount: 0,
    commentsCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, POSTS_COLLECTION), postData);

  return {
    id: docRef.id,
    title: sanitized.title,
    content: sanitized.content,
    categoryId: sanitized.categoryId,
    authorId: input.authorId,
    authorName: sanitized.authorName,
    imageUrl: sanitized.imageUrl,
    hugsCount: 0,
    commentsCount: 0,
    isHugged: false,
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
  pageSize: number = PAGE_SIZE,
  userId?: string,
  timeRange: TimeRange = "all"
): Promise<GetPostsResponse> => {
  const sortField = SORT_FIELDS[sortBy];

  // Calculate time threshold using utility
  const timeThreshold = getTimeRangeThreshold(timeRange);

  // Build constraints array
  const constraints = [];

  if (categoryId) {
    constraints.push(where("categoryId", "==", categoryId));
  }

  if (timeThreshold) {
    constraints.push(where("createdAt", ">=", timeThreshold));
  }

  constraints.push(orderBy(sortField, "desc"));

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  constraints.push(limit(pageSize));

  let q = query(collection(db, POSTS_COLLECTION), ...constraints);

  let snapshot;
  try {
    snapshot = await getDocs(q);
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
  const postIds = snapshot.docs.map((d) => d.id);

  // Get user's hugged posts in single query, then filter
  const userHuggedIds = await getUserHuggedPostIds(userId);
  const huggedSet = filterHuggedPosts(postIds, userHuggedIds);

  const posts = snapshot.docs.map((docSnap) =>
    convertToPost(docSnap, huggedSet.has(docSnap.id))
  );
  const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { posts, lastDoc: newLastDoc };
};

export const getPostById = async (
  postId: string,
  userId?: string
): Promise<Post | null> => {
  const docRef = doc(db, POSTS_COLLECTION, postId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const userHuggedIds = await getUserHuggedPostIds(userId);
    return convertToPost(docSnap, userHuggedIds.has(postId));
  }
  return null;
};

export interface GetPostsByUserResponse {
  posts: Post[];
  lastDoc: DocumentSnapshot | null;
}

export type ProfileSortOption = "newest" | "oldest";

export const getPostsByUser = async (
  authorId: string,
  currentUserId?: string,
  lastDoc?: DocumentSnapshot | null,
  pageSize: number = PAGE_SIZE,
  sortBy: ProfileSortOption = "newest"
): Promise<GetPostsByUserResponse> => {
  const sortDirection = sortBy === "newest" ? "desc" : "asc";

  let q = query(
    collection(db, POSTS_COLLECTION),
    where("authorId", "==", authorId),
    orderBy("createdAt", sortDirection),
    limit(pageSize)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  const postIds = snapshot.docs.map((d) => d.id);

  const userHuggedIds = await getUserHuggedPostIds(currentUserId);
  const huggedSet = filterHuggedPosts(postIds, userHuggedIds);

  const posts = snapshot.docs.map((docSnap) =>
    convertToPost(docSnap, huggedSet.has(docSnap.id))
  );
  const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { posts, lastDoc: newLastDoc };
};

export const toggleHug = async (
  postId: string,
  userId: string,
  userName: string
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

    // Send push notification to post author
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const postData = postSnap.data();
      notifyPostHug(postData.authorId, userId, userName, postId);
    }

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
