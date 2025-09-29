import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  PauseIcon,
  PlayIcon,
  StopIcon,
  VideoCameraIcon,
  EyeSlashIcon,
  EyeIcon,
} from "@heroicons/react/20/solid";
import useIsIos from "./isIos";

interface ButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
}

export const Button = ({ onClick }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className="rounded-full bg-blue-600 p-3 text-white shadow-lg hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 hover:shadow-xl hover:scale-105"
      title="Retour"
    >
      <ArrowLeftIcon aria-hidden="true" className="size-6" />
    </button>
  );
};

export const OpenCameraButton = ({ onClick }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className="inline-flex items-center gap-x-3 rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 hover:shadow-xl hover:scale-105"
    >
      <VideoCameraIcon aria-hidden="true" className="size-6" />
      <span>Open Camera</span>
    </button>
  );
};

export const UploadButton = ({
  onUpload,
  uploading,
}: {
  onUpload: (file: File) => void;
  uploading?: boolean;
}) => {
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpload?.(file);
  };

  const isIos = useIsIos();

  return (
    <label
      className={`inline-flex items-center gap-x-3 rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 ${
        uploading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {uploading ? (
        <>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          <span>Uploading...</span>
        </>
      ) : (
        <>
          {isIos ? (
            <VideoCameraIcon aria-hidden="true" className="size-6" />
          ) : (
            <CloudArrowUpIcon aria-hidden="true" className="size-6" />
          )}
          <span>{isIos ? "Record or upload video" : "Upload video"}</span>
        </>
      )}
      <input
        type="file"
        className="hidden"
        onChange={handleUpload}
        disabled={uploading}
        accept="video/*"
      />
    </label>
  );
};

export const RecordButton = ({
  onClick,
  isRecording,
}: ButtonProps & { isRecording: boolean }) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`rounded-full p-4 text-white shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all duration-300 hover:shadow-xl ${
        isRecording
          ? "bg-red-600 hover:bg-red-500 focus-visible:outline-red-600 animate-pulse hover:scale-102"
          : "bg-red-600 hover:bg-red-500 focus-visible:outline-red-600 hover:scale-105"
      }`}
      title={isRecording ? "Stop Recording" : "Start Recording"}
    >
      {isRecording ? (
        <StopIcon aria-hidden="true" className="size-8 transition-transform duration-200" />
      ) : (
        <div className="size-8 bg-red-400 rounded-full border-2 border-red-200 transition-all duration-200"></div>
      )}
    </button>
  );
};

export const PlayButton = ({
  onClick,
  isPlaying,
}: ButtonProps & { isPlaying: boolean }) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className="rounded-full bg-blue-600 p-4 text-white shadow-lg hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 hover:shadow-xl hover:scale-105"
      title={isPlaying ? "Pause" : "Play"}
    >
      {isPlaying ? (
        <PauseIcon aria-hidden="true" className="size-8" />
      ) : (
        <PlayIcon aria-hidden="true" className="size-8" />
      )}
    </button>
  );
};

export const BlurToggleButton = ({
  isEnabled,
  onClick,
}: {
  isEnabled: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 ${
        isEnabled
          ? "bg-purple-600 text-white hover:bg-purple-500 focus-visible:outline-purple-600"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus-visible:outline-gray-400"
      } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}
      title={isEnabled ? "Disable Blur" : "Enable Blur"}
    >
      {isEnabled ? (
        <EyeSlashIcon aria-hidden="true" className="size-4" />
      ) : (
        <EyeIcon aria-hidden="true" className="size-4" />
      )}
      <span>{isEnabled ? "Blur ON" : "Blur OFF"}</span>
    </button>
  );
};