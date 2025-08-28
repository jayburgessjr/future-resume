import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Debounce a value with a delay
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounce a callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay, ...deps]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Debounce async operations to prevent multiple simultaneous calls
 */
export function useAsyncDebounce<T extends (...args: any[]) => Promise<any>>(
  asyncCallback: T,
  delay: number = 300
): {
  execute: (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | null>;
  isLoading: boolean;
  cancel: () => void;
} {
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | null> => {
      // Cancel previous timeout and request
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      return new Promise((resolve) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            setIsLoading(true);
            abortControllerRef.current = new AbortController();
            
            const result = await asyncCallback(...args);
            
            if (!abortControllerRef.current.signal.aborted) {
              resolve(result);
            } else {
              resolve(null);
            }
          } catch (error) {
            if (!abortControllerRef.current?.signal.aborted) {
              console.error('Async debounced operation failed:', error);
              resolve(null);
            } else {
              resolve(null);
            }
          } finally {
            if (!abortControllerRef.current?.signal.aborted) {
              setIsLoading(false);
            }
          }
        }, delay);
      });
    },
    [asyncCallback, delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return { execute, isLoading, cancel };
}

/**
 * Auto-save hook with debouncing
 */
export function useAutoSave<T>(
  data: T,
  saveCallback: (data: T) => Promise<void> | void,
  options: {
    delay?: number;
    enabled?: boolean;
    skipFirst?: boolean;
  } = {}
): {
  isSaving: boolean;
  lastSaved: Date | null;
  forceSave: () => Promise<void>;
} {
  const { delay = 1000, enabled = true, skipFirst = true } = options;
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isFirstRender = useRef(true);

  const debouncedSave = useDebouncedCallback(
    async (dataToSave: T) => {
      if (!enabled || (isFirstRender.current && skipFirst)) {
        isFirstRender.current = false;
        return;
      }

      try {
        setIsSaving(true);
        await saveCallback(dataToSave);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    },
    delay,
    [saveCallback, enabled]
  );

  useEffect(() => {
    debouncedSave(data);
  }, [data, debouncedSave]);

  const forceSave = useCallback(async () => {
    try {
      setIsSaving(true);
      await saveCallback(data);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Force save failed:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [data, saveCallback]);

  return { isSaving, lastSaved, forceSave };
}

/**
 * Throttle a value (limit updates to once per interval)
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeElapsed = now - lastExecuted.current;

    if (timeElapsed >= interval) {
      setThrottledValue(value);
      lastExecuted.current = now;
    } else {
      const timerId = setTimeout(() => {
        setThrottledValue(value);
        lastExecuted.current = Date.now();
      }, interval - timeElapsed);

      return () => clearTimeout(timerId);
    }
  }, [value, interval]);

  return throttledValue;
}

/**
 * Search with debouncing and caching
 */
export function useDebouncedSearch<T>(
  searchFunction: (query: string) => Promise<T[]>,
  options: {
    delay?: number;
    minLength?: number;
    cacheResults?: boolean;
  } = {}
) {
  const { delay = 300, minLength = 2, cacheResults = true } = options;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const cacheRef = useRef<Map<string, T[]>>(new Map());
  const debouncedQuery = useDebounce(query, delay);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < minLength) {
      setResults([]);
      setError(null);
      return;
    }

    const search = async () => {
      try {
        setIsSearching(true);
        setError(null);

        // Check cache first
        if (cacheResults && cacheRef.current.has(debouncedQuery)) {
          const cachedResults = cacheRef.current.get(debouncedQuery);
          if (cachedResults) {
            setResults(cachedResults);
            return;
          }
        }

        const searchResults = await searchFunction(debouncedQuery);
        
        // Cache results
        if (cacheResults) {
          cacheRef.current.set(debouncedQuery, searchResults);
        }

        setResults(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    search();
  }, [debouncedQuery, searchFunction, minLength, cacheResults]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    clearCache
  };
}