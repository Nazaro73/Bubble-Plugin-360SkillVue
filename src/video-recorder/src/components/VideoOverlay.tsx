import React from 'react';

interface VideoOverlayProps {
  isEnabled: boolean;
  intensity: number;
  className?: string;
}

export const VideoOverlay: React.FC<VideoOverlayProps> = ({
  isEnabled,
  intensity,
  className = '',
}) => {
  if (!isEnabled) {
    return null;
  }

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-10 ${className}`}
      style={{
        backdropFilter: `blur(${intensity}px)`,
        WebkitBackdropFilter: `blur(${intensity}px)`,
        background: 'transparent',
      }}
    />
  );
};

export default VideoOverlay;