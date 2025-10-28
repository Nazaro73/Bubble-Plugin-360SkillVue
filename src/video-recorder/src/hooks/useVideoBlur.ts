import { useCallback, useRef } from 'react';

interface UseVideoBlurOptions {
  enabled: boolean;
  intensity: number;
  frameRate?: number;
}

export const useVideoBlur = ({ enabled, intensity, frameRate = 30 }: UseVideoBlurOptions) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processingRef = useRef<{
    video?: HTMLVideoElement;
    animationFrame?: number;
    stream?: MediaStream;
  }>({});

  const stopProcessing = useCallback(() => {
    if (processingRef.current.animationFrame) {
      cancelAnimationFrame(processingRef.current.animationFrame);
      processingRef.current.animationFrame = undefined;
    }
    
    if (processingRef.current.video) {
      processingRef.current.video.pause();
      processingRef.current.video.srcObject = null;
      processingRef.current.video = undefined;
    }
    
    if (processingRef.current.stream) {
      processingRef.current.stream.getTracks().forEach(track => track.stop());
      processingRef.current.stream = undefined;
    }
  }, []);

  const processVideoStream = useCallback(
    async (originalStream: MediaStream): Promise<MediaStream> => {
      if (!enabled || !canvasRef.current) {
        return originalStream;
      }

      try {
        // Nettoyer le traitement précédent
        stopProcessing();

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: false });

        if (!ctx) {
          return originalStream;
        }

        // Créer l'élément vidéo
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.srcObject = originalStream;
        
        processingRef.current.video = video;

        // Attendre que la vidéo soit prête
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Video load timeout')), 5000);

          video.onloadedmetadata = () => {
            clearTimeout(timeout);
            resolve();
          };

          video.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Video load error'));
          };
        });

        // Configurer le canvas
        const width = video.videoWidth || 1280;
        const height = video.videoHeight || 720;
        canvas.width = width;
        canvas.height = height;

        // Fonction de rendu
        let lastFrameTime = 0;
        const frameInterval = 1000 / frameRate;

        const renderFrame = (currentTime: number) => {
          if (!processingRef.current.video) return;

          if (currentTime - lastFrameTime >= frameInterval) {
            try {
              ctx.clearRect(0, 0, width, height);
              ctx.filter = `blur(${intensity}px)`;
              ctx.drawImage(video, 0, 0, width, height);
              lastFrameTime = currentTime;
            } catch (err) {
              // Render error
            }
          }

          if (processingRef.current.video && !video.paused && !video.ended) {
            processingRef.current.animationFrame = requestAnimationFrame(renderFrame);
          }
        };

        // Démarrer le rendu
        await video.play();
        processingRef.current.animationFrame = requestAnimationFrame(renderFrame);

        // Créer le stream depuis le canvas
        const canvasStream = canvas.captureStream(frameRate);
        
        // Ajouter l'audio original
        originalStream.getAudioTracks().forEach(track => {
          canvasStream.addTrack(track.clone());
        });

        processingRef.current.stream = canvasStream;

        return canvasStream;

      } catch (error) {
        stopProcessing();
        return originalStream;
      }
    },
    [enabled, intensity, frameRate, stopProcessing]
  );

  return {
    canvasRef,
    processVideoStream,
    stopProcessing,
  };
};