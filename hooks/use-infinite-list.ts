import { useCallback, useEffect, useRef, useState } from "react";

export interface UseInfiniteListOptions<T, P = void> {
  /** Fetch function that returns items and pagination info */
  fetchFn: (
    cursor: unknown | null,
    params: P
  ) => Promise<{ items: T[]; nextCursor: unknown | null }>;
  /** Parameters to pass to fetchFn (will trigger refetch when changed) */
  params: P;
  /** Number of items per page */
  pageSize?: number;
  /** Whether to fetch immediately on mount */
  enabled?: boolean;
}

export interface UseInfiniteListResult<T> {
  /** The list of all loaded items */
  items: T[];
  /** Whether the initial load is in progress */
  isLoading: boolean;
  /** Whether more items are being loaded */
  isLoadingMore: boolean;
  /** Whether a refresh is in progress */
  isRefreshing: boolean;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Error if any */
  error: Error | null;
  /** Load the next page */
  loadMore: () => Promise<void>;
  /** Refresh the list (reset and reload) */
  refresh: () => Promise<void>;
  /** Update an item in the list */
  updateItem: (id: string, updater: (item: T) => T) => void;
  /** Set items manually */
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
}

export function useInfiniteList<T extends { id: string }, P = void>({
  fetchFn,
  params,
  pageSize = 20,
  enabled = true,
}: UseInfiniteListOptions<T, P>): UseInfiniteListResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cursorRef = useRef<unknown | null>(null);
  const isLoadingRef = useRef(false);

  // Initial fetch
  const fetchInitial = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);
    cursorRef.current = null;

    try {
      const result = await fetchFn(null, params);
      setItems(result.items);
      cursorRef.current = result.nextCursor;
      setHasMore(result.items.length >= pageSize && result.nextCursor !== null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, params, pageSize, enabled]);

  // Load more items
  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore || isLoading) return;

    isLoadingRef.current = true;
    setIsLoadingMore(true);
    setError(null);

    try {
      const result = await fetchFn(cursorRef.current, params);
      setItems((prev) => [...prev, ...result.items]);
      cursorRef.current = result.nextCursor;
      setHasMore(result.items.length >= pageSize && result.nextCursor !== null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [fetchFn, params, pageSize, hasMore, isLoading]);

  // Refresh (pull-to-refresh)
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    cursorRef.current = null;

    try {
      const result = await fetchFn(null, params);
      setItems(result.items);
      cursorRef.current = result.nextCursor;
      setHasMore(result.items.length >= pageSize && result.nextCursor !== null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchFn, params, pageSize]);

  // Update a single item
  const updateItem = useCallback((id: string, updater: (item: T) => T) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? updater(item) : item))
    );
  }, []);

  // Fetch on mount and when params change
  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  return {
    items,
    isLoading,
    isLoadingMore,
    isRefreshing,
    hasMore,
    error,
    loadMore,
    refresh,
    updateItem,
    setItems,
  };
}
