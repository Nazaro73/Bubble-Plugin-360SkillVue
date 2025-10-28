import { useCallback } from 'react';

interface UseVideoOverlayBlurOptions {
  enabled: boolean;
  intensity: number;
}

export const useVideoOverlayBlur = ({ enabled, intensity }: UseVideoOverlayBlurOptions) => {
  
  const processVideoStream = useCallback(
    async (originalStream: MediaStream): Promise<MediaStream> => {
      // En mode overlay, on retourne toujours le stream original
      // Le flou est géré par l'overlay CSS par-dessus la vidéo
      return originalStream;
    },
    [enabled, intensity]
  );

  const stopProcessing = useCallback(() => {
    // Pas de nettoyage nécessaire pour l'overlay CSS
  }, []);

  return {
    processVideoStream,
    stopProcessing,
  };
};