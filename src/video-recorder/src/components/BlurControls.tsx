import React from 'react';
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/20/solid";

interface BlurControlsProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  intensity: number;
  onIntensityChange: (intensity: number) => void;
  disabled?: boolean;
}

export const BlurControls: React.FC<BlurControlsProps> = ({
  isEnabled,
  onToggle,
  intensity,
  onIntensityChange,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 shadow-sm">
      {/* Toggle Button */}
      <button
        onClick={() => onToggle(!isEnabled)}
        disabled={disabled}
        type="button"
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
          isEnabled
            ? "bg-purple-600 text-white hover:bg-purple-500 focus-visible:outline-purple-600 shadow-purple-200"
            : "bg-white text-purple-700 hover:bg-purple-50 focus-visible:outline-purple-400 border border-purple-200"
        } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}
        title={isEnabled ? "Disable video blur" : "Enable video blur"}
      >
        {isEnabled ? (
          <EyeSlashIcon aria-hidden="true" className="size-4" />
        ) : (
          <EyeIcon aria-hidden="true" className="size-4" />
        )}
        <span className="font-medium">
          {isEnabled ? "Blur ON" : "Blur OFF"}
        </span>
      </button>

      {/* Intensity Slider */}
      {isEnabled && (
        <div className="flex items-center gap-3 pl-4 border-l border-purple-200">
          <label className="text-sm font-medium text-purple-700 min-w-max">
            Intensity:
          </label>
          
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={intensity}
              onChange={(e) => onIntensityChange(parseInt(e.target.value))}
              disabled={disabled}
              className="w-24 h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, #9333ea 0%, #9333ea ${((intensity - 1) / 24) * 100}%, #e9d5ff ${((intensity - 1) / 24) * 100}%, #e9d5ff 100%)`
              }}
            />
            
            <div className="min-w-max">
              <span className="inline-flex items-center justify-center w-10 h-6 text-xs font-semibold text-purple-700 bg-purple-100 rounded-md border border-purple-200">
                {intensity}px
              </span>
            </div>
          </div>

          {/* Preview indicator */}
          <div className="flex items-center gap-2 text-xs text-purple-600">
            <div 
              className="w-4 h-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-sm"
              style={{ 
                filter: `blur(${Math.min(intensity / 4, 3)}px)`,
                transition: 'filter 0.2s ease-in-out'
              }}
            />
            <span className="font-medium">Preview</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Export par défaut également pour plus de flexibilité
export default BlurControls;