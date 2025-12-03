import { getCategories } from "@/services/category-service";
import { Category } from "@/types";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface CategoryContextType {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  getCategoryById: (id: string) => Category | undefined;
  refreshCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType>({
  categories: [],
  isLoading: true,
  error: null,
  getCategoryById: () => undefined,
  refreshCategories: async () => {},
});

export const useCategories = () => useContext(CategoryContext);

interface CategoryProviderProps {
  children: ReactNode;
}

export const CategoryProvider: React.FC<CategoryProviderProps> = ({
  children,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedCategories = await getCategories(forceRefresh);
      setCategories(fetchedCategories);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setError("An error occurred while loading categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const getCategoryById = useCallback(
    (id: string): Category | undefined => {
      return categories.find((cat) => cat.id === id);
    },
    [categories]
  );

  const refreshCategories = useCallback(async () => {
    await fetchCategories(true);
  }, [fetchCategories]);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        isLoading,
        error,
        getCategoryById,
        refreshCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};
