import { db } from "@/config/firebase";
import { Category } from "@/types";
import { CacheDuration, getCacheOrFetch, removeCache } from "@/utils/cache";
import {
  collection,
  doc,
  DocumentSnapshot,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";

const CATEGORIES_COLLECTION = "categories";
const CATEGORIES_CACHE_KEY = "categories";

// When translation is added, only the name part will be changed with i18n
const CATEGORY_DATA: Record<
  string,
  { name: string; emoji: string; color: string }
> = {
  relationships: { name: "İlişkiler", emoji: "💔", color: "#FF6B6B" },
  family: { name: "Aile", emoji: "👨‍👩‍👧‍👦", color: "#4ECDC4" },
  work: { name: "İş/Kariyer", emoji: "💼", color: "#45B7D1" },
  education: { name: "Okul/Eğitim", emoji: "📚", color: "#96CEB4" },
  financial: { name: "Maddi Sorunlar", emoji: "💰", color: "#FFEAA7" },
  health: { name: "Sağlık", emoji: "🏥", color: "#DDA0DD" },
  loneliness: { name: "Yalnızlık", emoji: "😔", color: "#87CEEB" },
  anxiety: { name: "Kaygı/Stres", emoji: "😰", color: "#F0E68C" },
  other: { name: "Diğer", emoji: "💭", color: "#C0C0C0" },
};

// Default data (for unknown categories)
const DEFAULT_CATEGORY_DATA = { name: "Diğer", emoji: "💭", color: "#C0C0C0" };

// Get category info (name, emoji, color)
export const getCategoryData = (categoryId: string) => {
  return CATEGORY_DATA[categoryId] || DEFAULT_CATEGORY_DATA;
};

// Legacy function - for backward compatibility
export const getCategoryStyle = (categoryId: string) => {
  const data = getCategoryData(categoryId);
  return { emoji: data.emoji, color: data.color };
};

// Convert Firebase data to Category
const convertToCategory = (docSnap: DocumentSnapshot): Category => {
  const data = docSnap.data()!;
  const categoryData = getCategoryData(docSnap.id);

  return {
    id: docSnap.id,
    name: categoryData.name,
    emoji: categoryData.emoji,
    color: categoryData.color,
    order: data.order || 0,
    isActive: data.isActive !== false,
  };
};

// All supported category IDs
const CATEGORY_IDS = [
  "relationships",
  "family",
  "work",
  "education",
  "financial",
  "health",
  "loneliness",
  "anxiety",
  "other",
];

// Convert default categories to full Category format
const getDefaultCategoriesWithStyles = (): Category[] => {
  return CATEGORY_IDS.map((id, index) => {
    const data = getCategoryData(id);
    return {
      id,
      name: data.name,
      emoji: data.emoji,
      color: data.color,
      order: index + 1,
      isActive: true,
    };
  });
};

// Get all active categories
export const getCategories = async (
  forceRefresh = false
): Promise<Category[]> => {
  try {
    return await getCacheOrFetch(
      CATEGORIES_CACHE_KEY,
      async () => {
        const q = query(
          collection(db, CATEGORIES_COLLECTION),
          where("isActive", "==", true),
          orderBy("order", "asc")
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          // If no categories in Firebase, load defaults and return
          console.log(
            "Categories not found in Firebase, loading default categories..."
          );
          await seedCategories();
          // Return default categories while Firebase is being seeded
          return getDefaultCategoriesWithStyles();
        }

        return snapshot.docs.map(convertToCategory);
      },
      CacheDuration.LONG,
      forceRefresh
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    // Return default categories on error
    return getDefaultCategoriesWithStyles();
  }
};

// Get category by ID
export const getCategoryById = async (
  categoryId: string
): Promise<Category | null> => {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return convertToCategory(docSnap);
    }
    return null;
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
};

// Load default categories to Firebase (for initial setup)
// Firebase only stores id, order, isActive - name/emoji/color are in frontend
export const seedCategories = async (): Promise<void> => {
  try {
    for (let i = 0; i < CATEGORY_IDS.length; i++) {
      const categoryId = CATEGORY_IDS[i];

      await setDoc(doc(db, CATEGORIES_COLLECTION, categoryId), {
        order: i + 1,
        isActive: true,
        createdAt: new Date(),
      });
    }

    console.log("Default categories loaded successfully!");
  } catch (error) {
    console.error("Category seed error:", error);
    throw error;
  }
};

// Clear cache
export const clearCategoriesCache = async (): Promise<void> => {
  try {
    await removeCache(CATEGORIES_CACHE_KEY);
  } catch (error) {
    console.error("Cache clearing error:", error);
  }
};
