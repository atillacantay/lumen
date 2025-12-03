import { db } from "@/config/firebase";
import { Comment } from "@/types";
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

const COMMENTS_COLLECTION = "comments";
const COMMENT_HUGS_COLLECTION = "comment_hugs";
const POSTS_COLLECTION = "posts";

export interface CreateCommentInput {
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
}

const convertToComment = (
  docSnap: DocumentSnapshot,
  isHugged = false
): Comment => {
  const data = docSnap.data()!;
  return {
    id: docSnap.id,
    postId: data.postId,
    content: data.content,
    authorId: data.authorId,
    authorName: data.authorName,
    hugsCount: data.hugsCount || 0,
    isHugged,
    createdAt: data.createdAt?.toDate() || new Date(),
  };
};

// Get all comment IDs that user has hugged - single query instead of N queries
const getUserHuggedCommentIds = async (
  userId?: string
): Promise<Set<string>> => {
  if (!userId) return new Set();

  const q = query(
    collection(db, COMMENT_HUGS_COLLECTION),
    where("userId", "==", userId),
    where("targetType", "==", "comment")
  );

  const snapshot = await getDocs(q);
  return new Set(snapshot.docs.map((doc) => doc.data().targetId));
};

// Filter hugged comments from a set of comment IDs
const filterHuggedComments = (
  commentIds: string[],
  userHuggedIds: Set<string>
): Set<string> => {
  return new Set(commentIds.filter((id) => userHuggedIds.has(id)));
};

export const createComment = async (
  input: CreateCommentInput
): Promise<Comment> => {
  const now = Timestamp.now();

  const commentData = {
    postId: input.postId,
    content: input.content,
    authorId: input.authorId,
    authorName: input.authorName,
    hugsCount: 0,
    createdAt: now,
  };

  const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), commentData);

  // Increment the post's comment count
  const postRef = doc(db, POSTS_COLLECTION, input.postId);
  await updateDoc(postRef, { commentsCount: increment(1) });

  return {
    id: docRef.id,
    ...input,
    hugsCount: 0,
    createdAt: now.toDate(),
  };
};

export type CommentSortOption = "oldest" | "newest" | "popular";

const COMMENT_SORT_CONFIG: Record<
  CommentSortOption,
  { field: string; direction: "asc" | "desc" }
> = {
  oldest: { field: "createdAt", direction: "asc" },
  newest: { field: "createdAt", direction: "desc" },
  popular: { field: "hugsCount", direction: "desc" },
};

export const getCommentsByPost = async (
  postId: string,
  sortBy: CommentSortOption = "oldest",
  userId?: string
): Promise<Comment[]> => {
  const { field, direction } = COMMENT_SORT_CONFIG[sortBy];

  const q = query(
    collection(db, COMMENTS_COLLECTION),
    where("postId", "==", postId),
    orderBy(field, direction)
  );

  const snapshot = await getDocs(q);
  const commentIds = snapshot.docs.map((d) => d.id);

  const userHuggedIds = await getUserHuggedCommentIds(userId);
  const huggedSet = filterHuggedComments(commentIds, userHuggedIds);

  return snapshot.docs.map((docSnap) =>
    convertToComment(docSnap, huggedSet.has(docSnap.id))
  );
};

export interface GetCommentsByUserResponse {
  comments: Comment[];
  lastDoc: DocumentSnapshot | null;
}

const COMMENTS_PAGE_SIZE = 20;

export const getCommentsByUser = async (
  authorId: string,
  currentUserId?: string,
  lastDoc?: DocumentSnapshot | null,
  pageSize: number = COMMENTS_PAGE_SIZE
): Promise<GetCommentsByUserResponse> => {
  let q = query(
    collection(db, COMMENTS_COLLECTION),
    where("authorId", "==", authorId),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  const commentIds = snapshot.docs.map((d) => d.id);

  const userHuggedIds = await getUserHuggedCommentIds(currentUserId);
  const huggedSet = filterHuggedComments(commentIds, userHuggedIds);

  const comments = snapshot.docs.map((docSnap) =>
    convertToComment(docSnap, huggedSet.has(docSnap.id))
  );
  const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { comments, lastDoc: newLastDoc };
};

export const toggleCommentHug = async (
  commentId: string,
  userId: string
): Promise<boolean> => {
  const hugId = `${userId}_${commentId}`;
  const hugRef = doc(db, COMMENT_HUGS_COLLECTION, hugId);
  const hugSnap = await getDoc(hugRef);
  const commentRef = doc(db, COMMENTS_COLLECTION, commentId);

  if (hugSnap.exists()) {
    await deleteDoc(hugRef);
    await updateDoc(commentRef, { hugsCount: increment(-1) });
    return false;
  } else {
    await setDoc(hugRef, {
      targetId: commentId,
      targetType: "comment",
      userId,
      createdAt: Timestamp.now(),
    });
    await updateDoc(commentRef, { hugsCount: increment(1) });
    return true;
  }
};

export const hasUserHuggedComment = async (
  commentId: string,
  userId: string
): Promise<boolean> => {
  const hugId = `${userId}_${commentId}`;
  const hugRef = doc(db, COMMENT_HUGS_COLLECTION, hugId);
  const hugSnap = await getDoc(hugRef);
  return hugSnap.exists();
};
