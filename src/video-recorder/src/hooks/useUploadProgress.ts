import { useState, useCallback, useRef, useEffect } from 'react';

export const useUploadProgress = () => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const realProgressRef = useRef(0);
  const simulatedProgressRef = useRef(0);
  const startTimeRef = useRef(0);
  const fileSizeRef = useRef(0);
  const lastRealProgressRef = useRef(0);
  const lastProgressTimeRef = useRef(0);
  const detectedSpeedRef = useRef<number | null>(null); // bytes per second

  // Nettoyer l'intervalle
  const clearProgressInterval = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Démarrer l'upload avec détection de débit en temps réel
  const startUpload = useCallback((fileSize: number = 10 * 1024 * 1024) => {
    setIsUploading(true);
    setProgress(0);
    realProgressRef.current = 0;
    simulatedProgressRef.current = 0;
    startTimeRef.current = Date.now();
    fileSizeRef.current = fileSize;
    lastRealProgressRef.current = 0;
    lastProgressTimeRef.current = Date.now();
    detectedSpeedRef.current = null;

    // Simulation de progression fluide avec interpolation vers la progression réelle
    progressIntervalRef.current = setInterval(() => {
      // Si on a une vraie progression de Bubble, interpoler vers celle-ci
      if (realProgressRef.current > simulatedProgressRef.current) {
        // La vraie progression est en avance : rattraper progressivement
        const diff = realProgressRef.current - simulatedProgressRef.current;
        // Avancer de 20% de la différence à chaque frame (plus rapide)
        simulatedProgressRef.current += Math.max(0.5, diff * 0.2);
      } else if (realProgressRef.current > 0) {
        // La vraie progression existe mais on est au même niveau ou en avance
        // Avancer très lentement pour ne pas dépasser la vraie progression
        simulatedProgressRef.current += 0.2;
      } else {
        // Au début, avant la première mise à jour, progresser lentement
        simulatedProgressRef.current += 0.3;
      }

      // IMPORTANT: Ne JAMAIS reculer, toujours limiter à 100%
      simulatedProgressRef.current = Math.min(100, Math.max(simulatedProgressRef.current, 0));

      setProgress(simulatedProgressRef.current);
    }, 50); // Mise à jour toutes les 50ms pour une animation très fluide
  }, []);

  // Callback pour la vraie progression de Bubble
  const updateRealProgress = useCallback((realProgress: number) => {
    // Mettre à jour la progression réelle - l'interpolation se fera dans l'intervalle
    realProgressRef.current = Math.min(realProgress, 100);

    // Si la vraie progression atteint 100%, on finalise
    if (realProgress >= 100) {
      clearProgressInterval();
      simulatedProgressRef.current = 100;
      setProgress(100);

      // Attendre un peu avant de masquer
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 1500);
    }
  }, [clearProgressInterval]);

  // Finaliser l'upload (appelé en cas de succès sans progression)
  const finishUpload = useCallback(() => {
    clearProgressInterval();

    // Animation rapide jusqu'à 100%
    const finishInterval = setInterval(() => {
      simulatedProgressRef.current = Math.min(simulatedProgressRef.current + 10, 100);
      setProgress(simulatedProgressRef.current);

      if (simulatedProgressRef.current >= 100) {
        clearInterval(finishInterval);
        setTimeout(() => {
          setIsUploading(false);
          setProgress(0);
        }, 1500);
      }
    }, 50);
  }, [clearProgressInterval]);

  // Annuler l'upload (en cas d'erreur)
  const cancelUpload = useCallback(() => {
    clearProgressInterval();
    setIsUploading(false);
    setProgress(0);
    realProgressRef.current = 0;
    simulatedProgressRef.current = 0;
  }, [clearProgressInterval]);

  // Nettoyer à la destruction du composant
  useEffect(() => {
    return () => {
      clearProgressInterval();
    };
  }, [clearProgressInterval]);

  return {
    progress,
    isUploading,
    startUpload,
    updateRealProgress,
    finishUpload,
    cancelUpload,
  };
};
