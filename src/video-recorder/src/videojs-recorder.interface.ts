
import Player from "video.js/dist/types/player";

export interface VideoJsRecorderPlugin {
	devices: MediaDeviceInfo[];
	enumerateDevices: () => void;
	getDevice: () => void;
	isRecording: () => boolean;
	start(): void;
	stop(): void;
	setVideoInput(deviceId: string): void;
	setAudioInput(deviceId: string): void;
}

export interface VideoJsRecorderPlayer extends Player {
	recordedData?: Blob;
	deviceErrorCode?: unknown;
	record: () => VideoJsRecorderPlugin;
}