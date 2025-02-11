import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  PauseIcon,
  PlayIcon,
  StopIcon,
  VideoCameraIcon,
} from "@heroicons/react/20/solid";

interface ButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
}

export const Button = ({ onClick }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className="rounded-full bg-blue-700 p-4 text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
    >
      <ArrowLeftIcon aria-hidden="true" className="size-8" />
    </button>
  );
};

export const OpenCameraButton = ({ onClick }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className="inline-flex items-center gap-x-2 rounded-md bg-blue-700 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
    >
      <VideoCameraIcon aria-hidden="true" className="-ml-0.5 size-5" />
      Open Camera
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
    // console.log(file);
  };
  return (
    <label
      className={`inline-flex items-center gap-x-2 rounded-md bg-blue-700 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
        uploading ? "opacity-50" : ""
      }`}
    >
      <CloudArrowUpIcon aria-hidden="true" className="-ml-0.5 size-5" />
      Upload video
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
      className={`rounded-full bg-red-600 p-4 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600`}
    >
      {isRecording ? (
        <StopIcon aria-hidden="true" className="size-8" />
      ) : (
        <VideoCameraIcon aria-hidden="true" className="size-8" />
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
      className={`rounded-full bg-blue-700 p-4 text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700`}
    >
      {isPlaying ? (
        <PauseIcon aria-hidden="true" className="size-8" />
      ) : (
        <PlayIcon aria-hidden="true" className="size-8" />
      )}
    </button>
  );
};
