import { useCallback, useEffect, useRef } from "react";

export function useObjectUrls() {
  const urls = useRef(new Set());
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    const active = urls.current;
    return () => {
      mounted.current = false;
      active.forEach((url) => URL.revokeObjectURL(url));
      active.clear();
    };
  }, []);
  const createObjectUrl = useCallback((blob) => {
    if (!mounted.current) return null;
    const url = URL.createObjectURL(blob);
    urls.current.add(url);
    return url;
  }, []);
  const revokeObjectUrl = useCallback((url) => {
    if (urls.current.delete(url)) URL.revokeObjectURL(url);
  }, []);
  return { createObjectUrl, revokeObjectUrl };
}
