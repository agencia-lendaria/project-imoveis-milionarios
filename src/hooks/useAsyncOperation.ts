import { useState, useCallback } from 'react';

interface UseAsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  throwOnError?: boolean;
}

export function useAsyncOperation<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  options: UseAsyncOperationOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: T): Promise<R | undefined> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await operation(...args);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options.onError?.(error);
        
        if (options.throwOnError) {
          throw error;
        }
        
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [operation, options]
  );

  return {
    execute,
    isLoading,
    error,
    clearError: () => setError(null)
  };
} 