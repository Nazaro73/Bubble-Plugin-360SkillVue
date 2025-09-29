import React, { useCallback, useEffect, useMemo, useState } from "react";
import VideoJSComponent from "./VideoJsPlayer";
import { VideoJsRecorderPlayer } from "./videojs-recorder.interface";

import {
  Button,
  OpenCameraButton,
  PlayButton,
  RecordButton,
  UploadButton,
  SwapCameraButton,
} from "./components/buttons";
import { DeviceSelector, OptionsDisclosure } from "./components/options";
import { BlurControls } from "./components/BlurControls";
import { useVideoBlur } from "./hooks/useVideoBlur";
import {
  BubblePluginContext,
  BubblePluginInstance,
  BubblePluginProperties,
  BubbleThing,
} from "./bubble.interface";
import useIsIos from "./components/isIos";

interface AppProps {
  id: string;
  instance: BubblePluginInstance;
  properties: BubblePluginProperties;
  context: BubblePluginContext;
}

function App({ instance, properties }: AppProps) {
  const playerRef = React.useRef<VideoJsRecorderPlayer | null>(null);

  const [isBlurEnabled, setIsBlurEnabled] = useState(false);
  const [blurIntensity, setBlurIntensity] = useState(8);

  // Détecter iOS avant son utilisation
  const isIos = useIsIos();

  // Utilisation du hook de floutage
  const { canvasRef, processVideoStream, stopProcessing } = useVideoBlur({
    enabled: isBlurEnabled,
    intensity: blurIntensity,
    frameRate: 30,
  });

  // Configuration de l'interception globale - seulement si le blur est utilisé
  useEffect(() => {
    // Ne pas intercepter du tout si le blur n'est pas activé
    if (!isBlurEnabled) {
      // S'assurer que l'original est restauré
      if ((window as any).originalGetUserMedia) {
        navigator.mediaDevices.getUserMedia = (window as any).originalGetUserMedia;
        console.log('Blur disabled - restored original getUserMedia');
      }
      return;
    }

    // Sauvegarder l'original seulement quand nécessaire
    if (!(window as any).originalGetUserMedia) {
      (window as any).originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      console.log('Original getUserMedia saved for blur processing');
    }

    // Configurer l'interception avec le blur activé
    console.log('🎥 Setting up blur interception with intensity:', blurIntensity);
    navigator.mediaDevices.getUserMedia = async (constraints: MediaStreamConstraints) => {
      console.log('🔍 INTERCEPTED getUserMedia call with blur enabled!', constraints);
      try {
        const originalStream = await (window as any).originalGetUserMedia(constraints);
        console.log('✅ Got original stream:', {
          id: originalStream.id,
          videoTracks: originalStream.getVideoTracks().length,
          audioTracks: originalStream.getAudioTracks().length
        });

        // Essayer le traitement avec blur
        try {
          console.log('🌀 Starting blur processing...');
          const blurredStream = await processVideoStream(originalStream);
          console.log('✅ Blur processing completed successfully:', {
            id: blurredStream.id,
            videoTracks: blurredStream.getVideoTracks().length,
            audioTracks: blurredStream.getAudioTracks().length
          });
          return blurredStream;
        } catch (blurError) {
          console.error('❌ Blur processing failed, falling back to original stream:', blurError);
          return originalStream;
        }
      } catch (error) {
        console.error('❌ Error getting original stream:', error);
        throw error; // Re-lancer l'erreur pour que VideoJS la gère
      }
    };

    return () => {
      // Cleanup: restaurer l'original si pas de blur
      if (!isBlurEnabled && (window as any).originalGetUserMedia) {
        navigator.mediaDevices.getUserMedia = (window as any).originalGetUserMedia;
      }
      stopProcessing();
    };
  }, [isBlurEnabled, blurIntensity, processVideoStream, stopProcessing]);

  const videoJsOptions = {
    controls: false,
    bigPlayButton: false,
    aspectRatio: "16:9",
    fluid: true,
    plugins: {
      record: {
        audio: true,
        video: isIos
          ? {
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 },
              frameRate: { ideal: 30, max: 30 },
              facingMode: "user" // Force camera frontale par défaut sur iOS
            }
          : {
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
        convertEngine: isIos ? "MediaRecorder" : "ts-ebml", // MediaRecorder pour iOS
        videoMimeType: isIos
          ? "video/mp4" // iOS préfère MP4
          : "video/webm;codecs=vp8",
        debug: true,
        frameWidth: isIos ? 1280 : 1280,
        frameHeight: isIos ? 720 : 720,
        frameRate: isIos ? 30 : 30, // 30fps pour iOS aussi
        maxLength: 10 * 60, // 10 minutes
        // Options spécifiques pour iOS Safari
        ...(isIos && {
          timeSlice: 1000, // Découper en tranches pour iOS
          videoBitsPerSecond: 2500000, // Limiter le bitrate
        })
      },
    },
  };

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [playerReady, setPlayerReady] = useState(false);
  const [currentVideoDeviceIndex, setCurrentVideoDeviceIndex] = useState(0);

  const [mode, setMode] = useState<"record" | "upload" | undefined>();

  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false); // État pour le redémarrage
  
  const videoThing = useMemo<BubbleThing | null>(
    () => properties.videoThing || null,
    [properties.videoThing]
  );

  // Fonction pour redémarrer la caméra
  const restartCamera = useCallback(async () => {
    if (!playerRef.current || recording) return;

    console.log('Restarting camera with new blur settings...', { isBlurEnabled, blurIntensity });
    setIsRestarting(true);

    try {
      // Arrêter l'enregistrement actuel s'il y en a un
      if (playerRef.current.record().isRecording()) {
        playerRef.current.record().stop();
      }

      // Arrêter le traitement de blur actuel
      stopProcessing();

      // Attendre que l'arrêt soit effectif et que l'interception soit mise à jour
      await new Promise(resolve => setTimeout(resolve, 500));

      // Forcer la re-detection des devices pour déclencher getUserMedia
      console.log('Triggering device re-detection...');

      // Redémarrer la caméra (cela devrait déclencher un nouvel appel à getUserMedia)
      playerRef.current.record().getDevice();

      console.log('Camera restarted successfully with blur settings:', { isBlurEnabled, blurIntensity });
    } catch (error) {
      console.error('Error restarting camera:', error);
    } finally {
      setIsRestarting(false);
    }
  }, [recording, stopProcessing, isBlurEnabled, blurIntensity]);

  const handlePlayerReady = useCallback((player: VideoJsRecorderPlayer) => {
    // S'assurer qu'on nettoie l'ancienne référence
    if (playerRef.current && playerRef.current !== player) {
      console.log('Cleaning up old player reference');
    }
    
    playerRef.current = player;

    // handle player events
    // device is ready
    player.on("deviceReady", () => {
      console.log("device is ready!");
      player.record().enumerateDevices();
      setPlayerReady(true);
      setCanPlay(false);
      setPlaying(false);
      setIsRestarting(false); // Fin du redémarrage
    });

    player.on("enumerateReady", function () {
      const devices = player.record().devices as MediaDeviceInfo[];

      const videoDevicesList: MediaDeviceInfo[] = [];
      const audioDevicesList: MediaDeviceInfo[] = [];

      // populate select options
      let deviceInfo, option, i;
      for (i = 0; i !== devices.length; ++i) {
        deviceInfo = devices[i];
        option = document.createElement("option");
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === "videoinput") {
          console.info("Found video input device: ", deviceInfo.label);
          videoDevicesList.push(deviceInfo);
        }
        if (deviceInfo.kind === "audioinput") {
          console.info("Found audio input device: ", deviceInfo.label);
          audioDevicesList.push(deviceInfo);
        }
      }
      setVideoDevices(videoDevicesList);
      setAudioDevices(audioDevicesList);
    });

    // user clicked the record button and started recording
    player.on("startRecord", () => {
      console.log("started recording!");
      setRecording(true);
      setCanPlay(false);
    });

    player.on("play", () => {
      setPlaying(true);
    });
    player.on("pause", () => {
      setPlaying(false);
    });

    // error handling
    // @ts-expect-error bad typings
    player.on("error", (element, error) => {
      console.warn("Player error:", error);
    });

    player.on("deviceError", () => {
      console.error("device error:", player.deviceErrorCode);
      setIsRestarting(false); // Arrêter l'indicateur de redémarrage en cas d'erreur

      // Message spécifique pour iOS Safari
      if (isIos) {
        console.warn('Camera access failed on iOS - this may be due to browser restrictions');
        console.warn('Potential solutions: 1) Allow camera access when prompted, 2) Check iOS Settings > Safari > Camera, 3) Try refresh page');

        // Essayer de redémarrer automatiquement après une erreur
        setTimeout(() => {
          if (playerRef.current && !recording) {
            console.log('Attempting automatic camera restart on iOS...');
            try {
              playerRef.current.record().getDevice();
            } catch (retryError) {
              console.error('Auto-restart failed:', retryError);
            }
          }
        }, 2000);
      }
    });
  }, []);

  const initPlayer = () => {
    if (!playerRef.current) return;

    console.log('Initializing player with blur settings:', { isBlurEnabled, blurIntensity });
    console.log('Device info:', { isIos, userAgent: navigator.userAgent });

    // Vérification des APIs nécessaires
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('getUserMedia not supported');
      alert('Camera access not supported on this device/browser');
      return;
    }

    setMode("record");
    playerRef.current.record().getDevice();
  };

  const toggleRecording = () => {
    if (!playerRef.current) return;

    if (playerRef.current.record().isRecording()) {
      console.log('Stopping recording...');
      playerRef.current.record().stop();
      stopProcessing();
    } else {
      console.log('Starting recording...');
      playerRef.current.record().start();
    }
  };

  const togglePlayingVideojs = () => {
    if (!playerRef.current) return;

    if (!canPlay) return;

    if (playerRef.current.paused()) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  };

  const handleVideoDeviceChange = (deviceId: string) => {
    if (!playerRef.current) return;

    try {
      playerRef.current.record().setVideoInput(deviceId);
    } catch (e) {
      console.error('Error changing video device:', e);
    }
  };

  const handleAudioDeviceChange = (deviceId: string) => {
    if (!playerRef.current) return;

    try {
      playerRef.current.record().setAudioInput(deviceId);
    } catch (e) {
      console.error('Error changing audio device:', e);
    }
  };

  // Fonction pour swap camera (front/back)
  const swapCamera = useCallback(async () => {
    if (!playerRef.current || recording || videoDevices.length < 2) return;

    console.log('Swapping camera...');
    setIsRestarting(true);

    try {
      // Calculer l'index de la prochaine caméra
      const nextIndex = (currentVideoDeviceIndex + 1) % videoDevices.length;
      const nextDevice = videoDevices[nextIndex];

      console.log('Switching to device:', nextDevice.label, 'Index:', nextIndex);

      // Arrêter l'enregistrement actuel s'il y en a un
      if (playerRef.current.record().isRecording()) {
        playerRef.current.record().stop();
      }

      // Arrêter le traitement de blur actuel
      stopProcessing();

      // Attendre que l'arrêt soit effectif
      await new Promise(resolve => setTimeout(resolve, 500));

      // Sur iOS, utiliser facingMode plutôt que deviceId quand possible
      if (isIos) {
        // Déterminer si c'est front ou back camera
        const isFrontCamera = nextDevice.label.toLowerCase().includes('front') ||
                             nextDevice.label.toLowerCase().includes('user') ||
                             nextDevice.label.toLowerCase().includes('face');

        const facingMode = isFrontCamera ? 'user' : 'environment';

        console.log('iOS: Using facingMode:', facingMode, 'for device:', nextDevice.label);

        // Forcer un redémarrage complet de la caméra sur iOS
        playerRef.current.record().stop();
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Redémarrer avec les nouvelles contraintes
        playerRef.current.record().getDevice();
      } else {
        // Sur autres plateformes, utiliser setVideoInput
        playerRef.current.record().setVideoInput(nextDevice.deviceId);
      }

      // Mettre à jour l'index
      setCurrentVideoDeviceIndex(nextIndex);

      console.log('Camera swapped successfully to:', nextDevice.label);
    } catch (error) {
      console.error('Error swapping camera:', error);
    } finally {
      setIsRestarting(false);
    }
  }, [recording, videoDevices, currentVideoDeviceIndex, stopProcessing, isIos]);

  const handleUpload = useCallback(
    (file: Blob) => {
      try {
        instance.uploadFile(
          file,
          (err, url) => {
            if (err) {
              console.error('Upload error:', err);
              return;
            }
            instance.publishState("videofile", url);
            instance.publishAutobinding(url);
          },
          videoThing
        );
      } catch (error) {
        console.error('Upload error:', error);
      }
    },
    [instance, videoThing]
  );

  const handleFinishRecordEvt = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    console.log("finished recording: ", player.recordedData);
    setRecording(false);
    setCanPlay(true);
    const blob = player.recordedData;
    if (!blob) return;
    
    stopProcessing();
    handleUpload(blob);
  }, [playerRef, handleUpload, stopProcessing]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    player.on("finishRecord", handleFinishRecordEvt);

    return () => {
      player.off("finishRecord", handleFinishRecordEvt);
    };
  }, [playerRef, handleUpload, handleFinishRecordEvt, stopProcessing]);

  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | undefined>();
  const handleManualUpload = useCallback(
    (file: File) => {
      setUploading(true);
      setMode("upload");

      try {
        instance.uploadFile(
          file,
          (err, url) => {
            setUploading(false);
            if (err) {
              console.error('Manual upload error:', err);
              return;
            }
            instance.publishState("videofile", url);
            instance.publishAutobinding(url);
            setUploadedUrl(url);
          },
          videoThing
        );
      } catch (error) {
        console.error('Manual upload error:', error);
        setUploading(false);
      }
    },
    [instance, videoThing]
  );

  // Handler pour les changements de paramètres de flou avec redémarrage automatique
  const handleBlurToggle = useCallback((enabled: boolean) => {
    if (recording) {
      console.warn('Cannot change blur settings while recording');
      return;
    }
    console.log('Blur toggle:', enabled);
    setIsBlurEnabled(enabled);

    // Redémarrer la caméra si elle est active pour appliquer le blur
    if (mode === "record" && playerReady) {
      console.log('Restarting camera to apply blur changes...');
      setTimeout(() => {
        restartCamera();
      }, 200); // Délai plus long pour laisser le state et l'interception se mettre à jour
    }
  }, [recording, mode, playerReady, restartCamera]);

  const handleBlurIntensityChange = useCallback((intensity: number) => {
    if (recording) {
      console.warn('Cannot change blur intensity while recording');
      return;
    }
    console.log('Blur intensity change:', intensity);
    setBlurIntensity(intensity);
    
    // Redémarrer la caméra si elle est active et que le blur est activé
    if (mode === "record" && playerReady && isBlurEnabled) {
      setTimeout(() => {
        restartCamera();
      }, 100); // Petit délai pour laisser le state se mettre à jour
    }
  }, [recording, mode, playerReady, isBlurEnabled, restartCamera]);

  return (
    <div className="App flex flex-col w-full h-full p-4 bg-white rounded-lg shadow-lg">
      {/* Canvas pour le traitement du flou - caché de l'utilisateur */}
      <canvas
        ref={canvasRef}
        className="hidden"
        width="1280"
        height="720"
      />

      {!mode && (
        <div className="flex flex-col justify-center items-center m-auto gap-6 p-8 bg-white rounded-2xl ">

          {isIos && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-sm text-blue-800 font-medium mb-1">📱 iOS/Safari User</p>
              <p className="text-xs text-blue-600">
                Camera recording now enabled! If you experience issues, use the upload option below.
              </p>
            </div>
          )}

          <OpenCameraButton onClick={initPlayer} />
          <div className="flex items-center gap-4 my-2">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
            <span className="text-sm text-gray-500 px-4 font-medium">or</span>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
          </div>
          <UploadButton onUpload={handleManualUpload} uploading={uploading} />
        </div>
      )}

      {mode === "upload" && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Uploaded Video</h3>
            <p className="text-sm text-gray-600">Your video is ready to use</p>
          </div>
          <video
            src={uploadedUrl}
            controls
            className="object-contain w-full h-full rounded-xl shadow-sm"
            playsInline
          />
        </div>
      )}

      <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Indicateur de redémarrage */}
        {isRestarting && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white rounded-lg p-4 flex items-center gap-3 shadow-xl">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700 font-medium">
                Applying blur settings...
              </span>
            </div>
          </div>
        )}
        
        <VideoJSComponent
          key={`videojs-${isBlurEnabled}-${blurIntensity}`} // Force re-render quand blur change
          options={videoJsOptions}
          onReady={handlePlayerReady}
          className={mode === "record" && playerReady && !isRestarting ? "" : "hidden"}
        />
      </div>

      <div className="flex flex-col mt-6 gap-6">
        {/* Contrôles de floutage - placés AVANT l'initialisation */}
        {mode === undefined && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Video Effects</h3>
              <p className="text-sm text-gray-600">Configure blur effect before recording</p>
            </div>
            <BlurControls
              isEnabled={isBlurEnabled}
              onToggle={handleBlurToggle}
              intensity={blurIntensity}
              onIntensityChange={handleBlurIntensityChange}
              disabled={false}
            />
          </div>
        )}

        {/* Contrôles principaux */}
        <div className="flex flex-col gap-4">
          {playerReady && mode === "record" && (
            <div className="flex flex-row w-full gap-4 justify-center items-center bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <Button onClick={() => setMode(undefined)} />

              <SwapCameraButton
                onClick={swapCamera}
                disabled={recording || isRestarting || videoDevices.length < 2}
              />

              <RecordButton
                onClick={toggleRecording}
                isRecording={recording}
              />

              {canPlay && (
                <PlayButton
                  onClick={togglePlayingVideojs}
                  isPlaying={playing}
                />
              )}
            </div>
          )}
          
          {/* Contrôles de floutage pendant l'enregistrement avec redémarrage automatique */}
          {playerReady && mode === "record" && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Video Effects</h3>
                <p className="text-sm text-gray-600">
                  {isRestarting 
                    ? "Applying new settings..." 
                    : "Camera will restart automatically when settings change"
                  }
                </p>
                {recording && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ Blur settings cannot be changed during recording
                  </p>
                )}
              </div>
              <BlurControls
                isEnabled={isBlurEnabled}
                onToggle={handleBlurToggle}
                intensity={blurIntensity}
                onIntensityChange={handleBlurIntensityChange}
                disabled={recording || isRestarting}
              />
            </div>
          )}
          
          {mode === "upload" && (
            <div className="flex flex-row justify-center items-center gap-4 bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <OpenCameraButton onClick={initPlayer} />
              <div className="flex items-center gap-2">
                <div className="h-px bg-gray-300 w-8"></div>
                <span className="text-sm text-gray-500 font-medium">or</span>
                <div className="h-px bg-gray-300 w-8"></div>
              </div>
              <UploadButton
                onUpload={handleManualUpload}
                uploading={uploading}
              />
            </div>
          )}
        </div>

        {/* Options avancées */}
        {mode === "record" && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <OptionsDisclosure devices={[...videoDevices, ...audioDevices]}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <DeviceSelector
                    deviceType="video"
                    devices={videoDevices}
                    onChange={handleVideoDeviceChange}
                  />
                </div>
                <div className="space-y-2">
                  <DeviceSelector
                    deviceType="audio"
                    devices={audioDevices}
                    onChange={handleAudioDeviceChange}
                  />
                </div>
              </div>
            </OptionsDisclosure>
          </div>
        )}
      </div>

      {/* Debug info étendu - Activé temporairement */}
      <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs">
        <h4 className="font-bold mb-2">Debug Info:</h4>
        <p>Mode: {mode || 'none'}</p>
        <p>Player Ready: {playerReady ? 'Yes' : 'No'}</p>
        <p>Recording: {recording ? 'Yes' : 'No'}</p>
        <p>Restarting: {isRestarting ? 'Yes' : 'No'}</p>
        <p>Blur Enabled: {isBlurEnabled ? 'Yes' : 'No'}</p>
        <p>Blur Intensity: {blurIntensity}px</p>
        <p>Can Play: {canPlay ? 'Yes' : 'No'}</p>
        <p>Is iOS: {isIos ? 'Yes' : 'No'}</p>
        <p>Video Devices: {videoDevices.length}</p>
        <p>Current Camera Index: {currentVideoDeviceIndex}</p>
        <p>Current Camera: {videoDevices[currentVideoDeviceIndex]?.label || 'N/A'}</p>
        <p>Swap Available: {videoDevices.length >= 2 ? 'Yes' : 'No'}</p>
        <p>Original getUserMedia saved: {(window as any).originalGetUserMedia ? 'Yes' : 'No'}</p>
        <p>Current getUserMedia intercepted: {navigator.mediaDevices.getUserMedia !== (window as any).originalGetUserMedia ? 'Yes' : 'No'}</p>
        <p>User Agent: {navigator.userAgent.substring(0, 50)}...</p>
      </div>
    </div>
  );
}

export default App;