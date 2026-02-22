import { useState, useEffect, useRef } from 'react';

interface UseLazyImageProps {
  src: string;
  alt: string;
  fallback?: string;
  threshold?: number;
}

export function useLazyImage({ src, alt, fallback, threshold = 0.1 }: UseLazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: '50px', // Carrega 50px antes de entrar na viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
      setError(false);
    };
    
    img.onerror = () => {
      setError(true);
      setIsLoaded(false);
    };
    
    img.src = src;
  }, [src, isInView]);

  return {
    imgRef,
    isLoaded,
    isInView,
    error,
    src: isInView ? (error ? fallback : src) : '',
  };
} 