import React from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

import "webrtc-adapter";
import "recordrtc";

/*
// Required imports when recording audio-only using the videojs-wavesurfer plugin
import WaveSurfer from 'wavesurfer.js';
import MicrophonePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.microphone.js';
WaveSurfer.microphone = MicrophonePlugin;

// Register videojs-wavesurfer plugin
import 'videojs-wavesurfer/dist/css/videojs.wavesurfer.css';
import Wavesurfer from 'videojs-wavesurfer/dist/videojs.wavesurfer.js';
*/

// register videojs-record plugin with this import
import "videojs-record/dist/css/videojs.record.css";
import "videojs-record/dist/videojs.record.js";
import { VideoJsRecorderPlayer } from "./videojs-recorder.interface";

interface VideoJsPlayerProps {
  options: Record<string, unknown>;
  onReady?: (player: VideoJsRecorderPlayer) => void;
  className?: string;
}

export const VideoJSComponent = (props: VideoJsPlayerProps) => {
  const videoRef = React.useRef<HTMLDivElement>(null);
  const playerRef = React.useRef<VideoJsRecorderPlayer | null>(null);
  const { options, onReady, className } = props;

  React.useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement("video-js");

      videoElement.className = "video-js vjs-default-skin";
      if (!videoRef.current) {
        return;
      }
      videoRef.current.appendChild(videoElement);

      const player = videojs(videoElement, options, () => {
        if (onReady) onReady(player as VideoJsRecorderPlayer);
      });

      playerRef.current = player as VideoJsRecorderPlayer;
      // You could update an existing player in the `else` block here
      // on prop change
    } else {
      // const player = playerRef.current;
    }
  }, [options, videoRef, onReady]);

  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    player.one("deviceReady", function () {
      // const test = player.record().getDevice();
      // console.log(test, test2);
    });

    player.on("loadeddata", () => {
      // console.log("loadeddata");
    });

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player>
      <div ref={videoRef} className={className} />
    </div>
  );
};

export default VideoJSComponent;
