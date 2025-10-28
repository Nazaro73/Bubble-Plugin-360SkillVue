import React from 'react';
import { CloudArrowUpIcon, CheckCircleIcon } from '@heroicons/react/20/solid';

interface UploadOverlayProps {
  isUploading: boolean;
  progress: number;
}

export const UploadOverlay: React.FC<UploadOverlayProps> = ({ isUploading, progress }) => {
  if (!isUploading) return null;

  const isComplete = progress >= 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all">
        <div className="flex flex-col items-center gap-6">
          {/* Icon */}
          <div className="relative">
            {isComplete ? (
              <div className="text-green-600">
                <CheckCircleIcon className="w-20 h-20 animate-bounce" />
              </div>
            ) : (
              <div className="text-blue-600 animate-pulse">
                <CloudArrowUpIcon className="w-20 h-20" />
              </div>
            )}
          </div>

          {/* Title */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {isComplete ? 'Upload terminé!' : 'Upload en cours...'}
            </h3>
            <p className="text-sm text-gray-600">
              {isComplete
                ? 'Votre vidéo a été téléchargée avec succès'
                : 'Veuillez patienter pendant le téléchargement de votre vidéo'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progression</span>
              <span className="text-sm font-bold text-blue-600">{Math.floor(progress)}%</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full ${
                  isComplete
                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Loading animation for indeterminate progress */}
          {progress < 0.5 && (
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
