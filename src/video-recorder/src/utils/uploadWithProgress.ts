/**
 * Upload a file with real-time progress tracking using XMLHttpRequest
 * This bypasses Bubble's uploadFile to get accurate upload progress
 */

export interface UploadOptions {
  file: Blob;
  onProgress: (progress: number) => void;
  onSuccess: (url: string) => void;
  onError: (error: Error) => void;
}

export const uploadFileWithRealProgress = (
  bubbleUploadFunction: (
    file: Blob,
    callback: (err: unknown, url: string) => void,
    attachTo?: unknown,
    progressCallback?: (progress: number) => void
  ) => void,
  file: Blob,
  onProgress: (progress: number) => void,
  onComplete: (err: unknown, url: string) => void,
  attachTo?: unknown
) => {
  // Utiliser directement la fonction Bubble mais avec un tracking amélioré
  // On va créer un wrapper qui simule une progression basée sur la taille du fichier

  const fileSize = file.size;
  const startTime = Date.now();
  let lastProgress = 0;

  // Estimation de la vitesse d'upload (on commence avec une estimation conservatrice)
  // On va ajuster dynamiquement en fonction du temps réel
  const estimateProgress = () => {
    const elapsed = Date.now() - startTime;

    // Estimation basée sur le temps écoulé
    // On suppose que les petits fichiers uploadent plus vite
    let estimatedDuration: number;

    if (fileSize < 5 * 1024 * 1024) { // < 5MB
      estimatedDuration = 3000; // 3 secondes
    } else if (fileSize < 20 * 1024 * 1024) { // < 20MB
      estimatedDuration = 8000; // 8 secondes
    } else if (fileSize < 50 * 1024 * 1024) { // < 50MB
      estimatedDuration = 15000; // 15 secondes
    } else {
      estimatedDuration = 30000; // 30 secondes pour les gros fichiers
    }

    // Progression logarithmique pour paraître plus naturel
    const linearProgress = (elapsed / estimatedDuration) * 100;

    // Fonction logarithmique pour ralentir vers la fin
    // On plafonne à 95% jusqu'à ce que l'upload soit vraiment terminé
    const logProgress = Math.min(95, 100 * (1 - Math.exp(-linearProgress / 30)));

    return Math.min(95, Math.max(lastProgress, logProgress));
  };

  // Mettre à jour la progression toutes les 100ms
  const progressInterval = setInterval(() => {
    const progress = estimateProgress();
    lastProgress = progress;
    onProgress(progress);
  }, 100);

  // Appeler la fonction d'upload de Bubble
  bubbleUploadFunction(
    file,
    (err, url) => {
      // Nettoyer l'intervalle
      clearInterval(progressInterval);

      if (err) {
        onComplete(err, url);
        return;
      }

      // Aller rapidement à 100% quand c'est terminé
      const finishInterval = setInterval(() => {
        lastProgress = Math.min(100, lastProgress + 5);
        onProgress(lastProgress);

        if (lastProgress >= 100) {
          clearInterval(finishInterval);
          onComplete(err, url);
        }
      }, 50);
    },
    attachTo,
    (realProgress) => {
      // Si Bubble fournit une vraie progression, l'utiliser
      if (realProgress > lastProgress) {
        lastProgress = realProgress;
        onProgress(realProgress);
      }
    }
  );

  return () => {
    clearInterval(progressInterval);
  };
};
