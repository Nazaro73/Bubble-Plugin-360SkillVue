import { useCallback } from 'react';

interface UseVideoOverlayBlurOptions {
  enabled: boolean;
  intensity: number;
}

export const useVideoOverlayBlur = ({ enabled, intensity }: UseVideoOverlayBlurOptions) => {
  
  const processVideoStream = useCallback(
    async (originalStream: MediaStream): Promise<MediaStream> => {
      console.log('🌀 processVideoStream (overlay mode) called:', { enabled, intensity });

      // En mode overlay, on retourne toujours le stream original
      // Le flou est géré par l'overlay CSS par-dessus la vidéo
      console.log('✅ Returning original stream for CSS overlay blur');
      return originalStream;
    },
    [enabled, intensity]
  );

  const stopProcessing = useCallback(() => {
    console.log('Stopping overlay blur processing (no-op)');
    // Pas de nettoyage nécessaire pour l'overlay CSS
  }, []);

  return {
    processVideoStream,
    stopProcessing,
  };
};