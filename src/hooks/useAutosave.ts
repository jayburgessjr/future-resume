import { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface AutosaveOptions {
  delay?: number;
  enabled?: boolean;
  showNotification?: boolean;
  onSave?: (data: any) => Promise<void> | void;
  onError?: (error: Error) => void;
}

interface AutosaveStatus {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: Error | null;
}

export function useAutosave<T>(
  data: T,
  saveFunction: (data: T) => Promise<void> | void,
  options: AutosaveOptions = {}
): AutosaveStatus & {
  forceSave: () => Promise<void>;
  markAsSaved: () => void;
} {
  const {
    delay = 2000,
    enabled = true,
    showNotification = false,
    onSave,
    onError
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<string>('');
  const isFirstRender = useRef(true);

  // Serialize data for comparison
  const dataString = JSON.stringify(data);
  const hasDataChanged = dataString !== lastDataRef.current;

  const performSave = useCallback(async (dataToSave: T): Promise<void> => {
    if (!enabled || isSaving) return;

    try {
      setIsSaving(true);
      setError(null);

      await saveFunction(dataToSave);
      
      const now = new Date();
      setLastSaved(now);
      setHasUnsavedChanges(false);
      lastDataRef.current = JSON.stringify(dataToSave);

      // Call onSave callback
      if (onSave) {
        await onSave(dataToSave);
      }

      // Show success notification if enabled
      if (showNotification) {
        toast({
          title: "Auto-saved",
          description: "Your changes have been saved automatically.",
          duration: 2000,
        });
      }
    } catch (err) {
      const saveError = err instanceof Error ? err : new Error('Save failed');
      setError(saveError);
      
      if (onError) {
        onError(saveError);
      } else if (showNotification) {
        toast({
          title: "Save failed",
          description: "Failed to save changes automatically.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } finally {
      setIsSaving(false);
    }
  }, [enabled, isSaving, saveFunction, onSave, showNotification, toast, onError]);

  const forceSave = async (): Promise<void> => {
    // Clear any pending autosave
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    await performSave(data);
  };

  const markAsSaved = (): void => {
    setLastSaved(new Date());
    setHasUnsavedChanges(false);
    lastDataRef.current = dataString;
    setError(null);
  };

  // Autosave effect
  useEffect(() => {
    // Skip first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastDataRef.current = dataString;
      return;
    }

    // Only trigger if data actually changed
    if (!hasDataChanged || !enabled) {
      return;
    }

    // Mark as having unsaved changes
    setHasUnsavedChanges(true);
    setError(null);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for autosave
    timeoutRef.current = setTimeout(() => {
      performSave(data);
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [dataString, hasDataChanged, enabled, delay, data, performSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle page unload with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && enabled) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, enabled]);

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    error,
    forceSave,
    markAsSaved
  };
}