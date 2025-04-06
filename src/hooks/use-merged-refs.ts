// src/hooks/use-merged-refs.ts
import { useCallback } from 'react';
import type { Ref, RefCallback, MutableRefObject } from 'react';

/**
 * Custom hook to merge multiple refs into a single ref callback.
 * Useful when you need to apply multiple refs to a single element.
 * 
 * @param refs Array of refs to merge
 * @returns A callback ref that updates all the provided refs
 */
export function useMergedRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return useCallback((element: T) => {
    // Update each ref in the array with the element
    refs.forEach((ref) => {
      if (!ref) return;
      
      // Handle different types of refs
      if (typeof ref === 'function') {
        ref(element);
      } else {
        // This is a special way to update a ref's current property
        // Using TypeScript's type assertion to bypass the readonly constraint
        // It's safe in this context since we're just setting the ref value as React would
        (ref as MutableRefObject<T>).current = element;
      }
    });
  }, [refs]);
}