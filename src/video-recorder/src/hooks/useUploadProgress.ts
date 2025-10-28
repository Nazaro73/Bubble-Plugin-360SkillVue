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

    // Estimation initiale de la vitesse (conservatrice : 1 Mbps upload)
    let estimatedSpeed = 125 * 1024; // 1 Mbps = 125 KB/s = 125 * 1024 bytes/s

    // Calcul de la durée estimée basée sur la vitesse
    let estimatedDuration = (fileSize / estimatedSpeed) * 1000; // en ms

    // Simulation de progression fluide avec ajustement dynamique
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;

      // Si on a détecté une vraie vitesse, ajuster la durée estimée
      if (detectedSpeedRef.current && detectedSpeedRef.current > 0) {
        estimatedDuration = (fileSizeRef.current / detectedSpeedRef.current) * 1000;
      }

      // Si on a une vraie progression de Bubble, se synchroniser
      if (realProgressRef.current > simulatedProgressRef.current + 5) {
        // Rattraper progressivement
        const diff = realProgressRef.current - simulatedProgressRef.current;
        simulatedProgressRef.current += Math.max(1, Math.floor(diff / 2));
      } else if (realProgressRef.current > 0 && realProgressRef.current < simulatedProgressRef.current) {
        // Si la vraie progression est en retard, ralentir
        simulatedProgressRef.current = realProgressRef.current;
      } else {
        // Sinon, estimer la progression basée sur le temps écoulé et la vitesse détectée
        const linearProgress = (elapsed / estimatedDuration) * 100;

        // Courbe logarithmique pour paraître plus naturel
        // On plafonne à 95% jusqu'à confirmation de fin d'upload
        const logProgress = 100 * (1 - Math.exp(-linearProgress / 30));
        const newProgress = Math.min(95, Math.max(simulatedProgressRef.current, logProgress));

        // Avancer progressivement (jamais reculer)
        simulatedProgressRef.current = Math.max(simulatedProgressRef.current, newProgress);
      }

      setProgress(Math.round(simulatedProgressRef.current));
    }, 100); // Mise à jour toutes les 100ms pour plus de fluidité
  }, []);

  // Callback pour la vraie progression de Bubble avec détection de vitesse
  const updateRealProgress = useCallback((realProgress: number) => {
    const now = Date.now();
    const previousProgress = lastRealProgressRef.current;
    const previousTime = lastProgressTimeRef.current;

    realProgressRef.current = Math.min(realProgress, 100);

    // Détecter la vitesse d'upload basée sur la progression réelle
    if (realProgress > previousProgress && realProgress > 5) {
      const progressDelta = realProgress - previousProgress; // en pourcentage
      const timeDelta = (now - previousTime) / 1000; // en secondes

      if (timeDelta > 0.1) { // Éviter les divisions par 0 ou trop petites
        // Calculer les bytes uploadés
        const bytesUploaded = (progressDelta / 100) * fileSizeRef.current;
        // Calculer la vitesse en bytes/sec
        const currentSpeed = bytesUploaded / timeDelta;

        // Moyenne mobile pour lisser la vitesse détectée
        if (detectedSpeedRef.current === null) {
          detectedSpeedRef.current = currentSpeed;
        } else {
          // Moyenne pondérée : 70% ancienne vitesse + 30% nouvelle
          detectedSpeedRef.current = detectedSpeedRef.current * 0.7 + currentSpeed * 0.3;
        }

        lastRealProgressRef.current = realProgress;
        lastProgressTimeRef.current = now;
      }
    }

    // Si la vraie progression atteint 100%, on finalise
    if (realProgress >= 100) {
      clearProgressInterval();
      simulatedProgressRef.current = 100;
      setProgress(100);

      // Attendre un peu avant de masquer
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
        detectedSpeedRef.current = null;
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
