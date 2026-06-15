import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

/**
 * Hook to handle loading state that persists during page navigation.
 * Ensures the loading spinner is visible while the redirect happens.
 * 
 * Usage:
 * const { loading: isLoading, withLoading } = useLoadingWithNavigation();
 * 
 * const handleSubmit = async () => {
 *   await withLoading(async () => {
 *     await someApiCall();
 *     router.push('/new-page');
 *   });
 * };
 */
export function useLoadingWithNavigation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigationStartedRef = useRef(false);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      navigationStartedRef.current = true;
    };

    const handleRouteChangeComplete = () => {
      setLoading(false);
      navigationStartedRef.current = false;
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeComplete);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      router.events.off("routeChangeError", handleRouteChangeComplete);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [router]);

  const withLoading = async (callback: () => Promise<void>, minLoadingTime = 500) => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      await callback();
      // Give router event a chance to fire after callback completes
      await new Promise(resolve => setTimeout(resolve, 10));
    } catch (error) {
      // If there's an error during the callback, stop loading after min time
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsed);
      
      if (remainingTime > 0) {
        await new Promise(resolve => {
          timeoutRef.current = setTimeout(resolve, remainingTime);
        });
      }
      setLoading(false);
      throw error;
    }
    
    // Keep loading visible during navigation
    // If navigation doesn't happen within a timeout, stop loading
    if (navigationStartedRef.current) {
      // Navigation already started, keep loading until complete
      return;
    }

    // Ensure minimum loading time for UX
    const elapsed = Date.now() - startTime;
    if (elapsed < minLoadingTime) {
      await new Promise(resolve => {
        timeoutRef.current = setTimeout(() => {
          if (!navigationStartedRef.current) {
            setLoading(false);
          }
          resolve(null);
        }, minLoadingTime - elapsed);
      });
    } else if (!navigationStartedRef.current) {
      setLoading(false);
    }
  };

  return { loading, withLoading };
}
