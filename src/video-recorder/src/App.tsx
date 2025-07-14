import React, { useCallback, useEffect, useMemo, useState } from "react";
import VideoJSComponent from "./VideoJsPlayer";
import { VideoJsRecorderPlayer } from "./videojs-recorder.interface";

import {
  Button,
  OpenCameraButton,
  PlayButton,
  RecordButton,
  UploadButton,
} from "./components/buttons";
import { DeviceSelector, OptionsDisclosure } from "./components/options";
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
  const videoJsOptions = {
    controls: false,
    bigPlayButton: false,
    aspectRatio: "16:9",
    fluid: true,
    plugins: {
      record: {
        audio: true,
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },

        convertEngine: "ts-ebml",
        videoMimeType: "video/webm;codecs=vp8",
        debug: true,
        frameWidth: 1280,
        frameHeight: 720,
        frameRate: 30,
        maxLength: 10 * 60, // 10 minutes
      },
    },
  };

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [playerReady, setPlayerReady] = useState(false);

  const [mode, setMode] = useState<"record" | "upload" | undefined>();

  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const videoThing = useMemo<BubbleThing | null>(
    () => properties.videoThing || null,
    [properties.videoThing]
  );

  const handlePlayerReady = (player: VideoJsRecorderPlayer) => {
    playerRef.current = player;

    // handle player events
    // device is ready
    player.on("deviceReady", () => {
      console.log("device is ready!");
      player.record().enumerateDevices();
      setPlayerReady(true);
      setCanPlay(false);
      setPlaying(false);
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
          // option.text =
          //   deviceInfo.label || "input device " + (inputSelector.length + 1);
          // inputSelector.appendChild(option);
          videoDevicesList.push(deviceInfo);
        }
        if (deviceInfo.kind === "audioinput") {
          console.info("Found audio input device: ", deviceInfo.label);
          // option.text =
          //   deviceInfo.label || "input device " + (inputSelector.length + 1);
          // inputSelector.appendChild(option);
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
    // const toBase64 = (file: Blob): Promise<string> =>
    //   new Promise((resolve, reject) => {
    //     const reader = new FileReader();
    //     reader.readAsDataURL(file);
    //     reader.onload = () => resolve(reader.result as string);
    //     reader.onerror = reject;
    //   });

    player.on("play", () => {
      setPlaying(true);
    });
    player.on("pause", () => {
      setPlaying(false);
    });

    // error handling
    // @ts-expect-error bad typings
    player.on("error", (element, error) => {
      console.warn(error);
    });

    player.on("deviceError", () => {
      console.error("device error:", player.deviceErrorCode);
    });
  };

  const initPlayer = () => {
    if (!playerRef.current) return;
    setMode("record");
    playerRef.current.record().getDevice();
  };

  const toggleRecording = () => {
    if (!playerRef.current) return;

    if (playerRef.current.record().isRecording()) {
      playerRef.current.record().stop();
    } else {
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
    // setCanPlay(false);

    try {
      playerRef.current.record().setVideoInput(deviceId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAudioDeviceChange = (deviceId: string) => {
    if (!playerRef.current) return;
    // setCanPlay(false);

    try {
      playerRef.current.record().setAudioInput(deviceId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpload = useCallback(
    (file: Blob) => {
      try {
        instance.uploadFile(
          file,
          (err, url) => {
            if (err) {
              console.error(err);
              return;
            }
            instance.publishState("videofile", url);
            instance.publishAutobinding(url);

            // bubble.context.videoThing.set(
            //   bubble.properties.videoThingFieldName,
            //   url
            // );
          },
          videoThing
        );
      } catch (error) {
        console.error(error);
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
    handleUpload(blob);
  }, [playerRef, handleUpload]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    // user completed recording and stream is available
    player.on("finishRecord", handleFinishRecordEvt);

    return () => {
      player.off("finishRecord", handleFinishRecordEvt);
    };
  }, [playerRef, handleUpload, handleFinishRecordEvt]);

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
              console.error(err);
              return;
            }
            instance.publishState("videofile", url);
            instance.publishAutobinding(url);
            setUploadedUrl(url);

            // bubble.context.videoThing.set(
            //   bubble.properties.videoThingFieldName,
            //   url
            // );
          },
          videoThing
        );
      } catch (error) {
        console.error(error);
      }
    },
    [instance, videoThing]
  );

  const isIos = useIsIos();

  return (
    <div className="App flex flex-col w-full h-full p-2">
      {!mode && (
        <div className="flex flex-col justify-center align-middle m-auto gap-2">
          {/** Hide the direct recording option due to iOS limitations */}
          {!isIos && (
            <>
              <OpenCameraButton onClick={initPlayer}></OpenCameraButton>
              <span className="text-center">or</span>
            </>
          )}
          <UploadButton
            onUpload={handleManualUpload}
            uploading={uploading}
          ></UploadButton>
        </div>
      )}
      {mode === "upload" && (
        <video
          src={uploadedUrl}
          controls
          className="object-contain w-full h-full"
          playsInline
        />
      )}
      <VideoJSComponent
        options={videoJsOptions}
        onReady={handlePlayerReady}
        className={mode === "record" && playerReady ? "" : "hidden"}
      />
      <div className="flex flex-col mt-4 gap-4">
        <div className="flex flex-row w-full gap-4 justify-center">
          {playerReady && mode === "record" && (
            <>
              <Button onClick={() => setMode(undefined)}></Button>
              <RecordButton
                onClick={toggleRecording}
                isRecording={recording}
              ></RecordButton>
            </>
          )}
          {canPlay && mode === "record" && (
            <PlayButton
              onClick={togglePlayingVideojs}
              isPlaying={playing}
            ></PlayButton>
          )}
          {mode === "upload" && (
            <div className="flex flex-row justify-center align-middle m-auto gap-4">
              {!isIos && (
                <>
                  <OpenCameraButton onClick={initPlayer}></OpenCameraButton>
                  <span className="text-center content-center">or</span>
                </>
              )}
              <UploadButton
                onUpload={handleManualUpload}
                uploading={uploading}
              ></UploadButton>
            </div>
          )}
        </div>
        {mode === "record" && (
          <OptionsDisclosure devices={[...videoDevices, ...audioDevices]}>
            <div className="flex flex-row w-full gap-4 pt-2">
              <div className="flex flex-col w-full">
                <DeviceSelector
                  deviceType="video"
                  devices={videoDevices}
                  onChange={handleVideoDeviceChange}
                />
              </div>
              <div className="flex flex-col w-full">
                <DeviceSelector
                  deviceType="audio"
                  devices={audioDevices}
                  onChange={handleAudioDeviceChange}
                />
              </div>
            </div>
          </OptionsDisclosure>
        )}
      </div>
    </div>
  );
}

export default App;
