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
  orderBy,
  query,
  setDoc,
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

const convertToComment = (docSnap: DocumentSnapshot): Comment => {
  const data = docSnap.data()!;
  return {
    id: docSnap.id,
    postId: data.postId,
    content: data.content,
    authorId: data.authorId,
    authorName: data.authorName,
    hugsCount: data.hugsCount || 0,
    createdAt: data.createdAt?.toDate() || new Date(),
  };
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
  sortBy: CommentSortOption = "oldest"
): Promise<Comment[]> => {
  const { field, direction } = COMMENT_SORT_CONFIG[sortBy];

  const q = query(
    collection(db, COMMENTS_COLLECTION),
    where("postId", "==", postId),
    orderBy(field, direction)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(convertToComment);
};

export const getCommentsByUser = async (userId: string): Promise<Comment[]> => {
  const q = query(
    collection(db, COMMENTS_COLLECTION),
    where("authorId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(convertToComment);
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
