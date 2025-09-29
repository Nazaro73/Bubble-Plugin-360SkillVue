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
    console.log('Stopping video blur processing');
    
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
      console.log('🌀 processVideoStream called:', { enabled, intensity, frameRate });
      console.log('📱 Device info:', {
        userAgent: navigator.userAgent.substring(0, 50),
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent)
      });

      if (!enabled || !canvasRef.current) {
        console.log('⚠️ Blur disabled or no canvas, returning original stream');
        return originalStream;
      }

      console.log('✅ Starting blur processing with canvas:', canvasRef.current);
      console.log('📺 Original stream info:', {
        id: originalStream.id,
        videoTracks: originalStream.getVideoTracks().length,
        audioTracks: originalStream.getAudioTracks().length,
        videoTrack: originalStream.getVideoTracks()[0]?.getSettings()
      });

      try {
        // Nettoyer le traitement précédent
        stopProcessing();

        const canvas = canvasRef.current;

        // Configuration canvas spécialement optimisée pour iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const ctx = canvas.getContext('2d', {
          alpha: false,
          willReadFrequently: false,
          // Options iOS spécifiques
          ...(isIOS && {
            desynchronized: true, // Meilleure performance iOS
          })
        });

        if (!ctx) {
          console.error('❌ Cannot get canvas context');
          return originalStream;
        }

        console.log('✅ Canvas context created successfully');

        // Créer l'élément vidéo
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true; // Crucial pour iOS
        video.autoplay = true;
        video.srcObject = originalStream;

        // iOS spécifique
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('playsinline', 'true');

        processingRef.current.video = video;

        console.log('📺 Video element created, waiting for metadata...');

        // Attendre que la vidéo soit prête avec timeout adapté pour iOS
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            console.error('❌ Video load timeout after', isIOS ? '15s' : '10s');
            reject(new Error('Video load timeout'));
          }, isIOS ? 15000 : 10000); // 15s timeout pour iOS, 10s pour autres

          video.onloadedmetadata = () => {
            clearTimeout(timeout);
            console.log('✅ Video metadata loaded:', {
              width: video.videoWidth,
              height: video.videoHeight,
              duration: video.duration,
              readyState: video.readyState
            });
            resolve();
          };

          video.onerror = (error) => {
            clearTimeout(timeout);
            console.error('❌ Video load error:', error);
            reject(new Error('Video load error'));
          };

          // iOS peut avoir besoin d'un play() explicite
          video.play().then(() => {
            console.log('✅ Video play() successful');
          }).catch((playError) => {
            console.warn('⚠️ Video play() failed:', playError);
          });
        });

        // Configurer le canvas avec des dimensions appropriées
        const width = video.videoWidth || 1280;
        const height = video.videoHeight || 720;
        canvas.width = width;
        canvas.height = height;

        console.log('🎨 Canvas configured:', { width, height });

        // Fonction de rendu optimisée pour iOS
        let lastFrameTime = 0;
        // iOS : frameRate plus conservateur pour les performances
        const effectiveFrameRate = isIOS ? Math.min(frameRate, 24) : frameRate;
        const frameInterval = 1000 / effectiveFrameRate;
        let frameCount = 0;

        console.log(`🎬 Using frame rate: ${effectiveFrameRate}fps (iOS: ${isIOS})`);


        const renderFrame = (currentTime: number) => {
          if (!processingRef.current.video || !video) return;

          if (currentTime - lastFrameTime >= frameInterval) {
            try {
              // Vérifier que la vidéo est toujours en lecture
              if (video.readyState >= 2) { // HAVE_CURRENT_DATA
                ctx.clearRect(0, 0, width, height);
                ctx.filter = `blur(${intensity}px)`;
                ctx.drawImage(video, 0, 0, width, height);

                frameCount++;
                // iOS : Log moins fréquent pour les performances
                const logInterval = isIOS ? 60 : 30; // Toutes les 60 frames sur iOS
                if (frameCount % logInterval === 0) {
                  console.log(`🎬 ${isIOS ? 'iOS' : ''} Frame ${frameCount} rendered with blur ${intensity}px`);
                }
              }
              lastFrameTime = currentTime;
            } catch (err) {
              console.error('❌ Render error:', err);
            }
          }

          if (processingRef.current.video && !video.paused && !video.ended) {
            processingRef.current.animationFrame = requestAnimationFrame(renderFrame);
          } else {
            console.log('⏹️ Video playback stopped:', { paused: video.paused, ended: video.ended });
          }
        };

        // Démarrer le rendu après s'assurer que la vidéo joue
        try {
          await video.play();
          console.log('✅ Video playback started');
        } catch (playError) {
          console.warn('⚠️ Video play failed, continuing anyway:', playError);
        }

        processingRef.current.animationFrame = requestAnimationFrame(renderFrame);

        // Créer le stream depuis le canvas avec options optimisées pour iOS
        let canvasStream: MediaStream;
        try {
          // iOS : utiliser le frameRate effectif (plus conservateur)
          canvasStream = canvas.captureStream(effectiveFrameRate);
          console.log('✅ Canvas stream created:', {
            id: canvasStream.id,
            videoTracks: canvasStream.getVideoTracks().length,
            frameRate: effectiveFrameRate,
            platform: isIOS ? 'iOS' : 'Other'
          });
        } catch (captureError) {
          console.error('❌ Canvas captureStream failed:', captureError);
          return originalStream;
        }

        // Ajouter l'audio original
        originalStream.getAudioTracks().forEach(track => {
          try {
            const clonedTrack = track.clone();
            canvasStream.addTrack(clonedTrack);
            console.log('✅ Audio track added:', clonedTrack.id);
          } catch (audioError) {
            console.error('❌ Failed to add audio track:', audioError);
          }
        });

        processingRef.current.stream = canvasStream;

        console.log('🎉 Blur processing setup complete!', {
          canvasStreamId: canvasStream.id,
          videoTracks: canvasStream.getVideoTracks().length,
          audioTracks: canvasStream.getAudioTracks().length
        });

        return canvasStream;

      } catch (error) {
        console.error('💥 Error setting up blur:', error);
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