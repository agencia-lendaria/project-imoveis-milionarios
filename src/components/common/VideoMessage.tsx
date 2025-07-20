import React, { useState } from 'react';
import { Play, Download, Clock, Eye, Video, Pause } from 'lucide-react';

interface VideoMessageProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize?: string;
  duration?: string;
  timestamp?: string;
  caption?: string;
}

const VideoMessage: React.FC<VideoMessageProps> = ({
  videoUrl,
  thumbnailUrl,
  fileName,
  fileSize,
  duration,
  timestamp,
  caption
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (videoError || !videoUrl) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200/50 shadow-sm max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-full p-2">
              <Video size={16} className="text-blue-600" />
            </div>
            <div>
              <span className="text-sm font-medium text-blue-800">
                Vídeo não disponível
              </span>
              {timestamp && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <Clock size={12} />
                  {timestamp}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informações do arquivo */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Video size={14} className="text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Arquivo de vídeo:</span>
          </div>
          <p className="text-sm text-gray-700 break-all">
            {fileName}
          </p>
          {fileSize && (
            <p className="text-xs text-gray-500 mt-1">
              Tamanho: {fileSize}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200/50 shadow-sm max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-full p-2">
            <Video size={16} className="text-blue-600" />
          </div>
          <div>
            <span className="text-sm font-medium text-blue-800">
              Vídeo
            </span>
            {timestamp && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Clock size={12} />
                {timestamp}
              </div>
            )}
          </div>
        </div>
        
        {/* Botão de download */}
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 px-3 py-1 bg-white/80 hover:bg-white rounded-lg transition-all duration-200 text-xs text-blue-600 hover:text-blue-800"
        >
          <Download size={12} />
          Baixar
        </button>
      </div>

      {/* Player de vídeo */}
      <div className="relative mb-3">
        <video
          className="w-full rounded-lg shadow-sm"
          controls
          preload="metadata"
          onError={() => setVideoError(true)}
          poster={thumbnailUrl}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/ogg" />
          Seu navegador não suporta reprodução de vídeo.
        </video>
        
        {/* Overlay com informações */}
        <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
          <div className="flex items-center justify-between text-white text-xs">
            <span className="font-medium truncate">
              {fileName}
            </span>
            {duration && (
              <span className="ml-2 flex-shrink-0">
                {duration}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Informações do arquivo */}
      {fileSize && (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-100 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Video size={14} className="text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Detalhes:</span>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">
              Tamanho: {fileSize}
            </p>
            {duration && (
              <p className="text-xs text-gray-500">
                Duração: {duration}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Legenda */}
      {caption && (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={14} className="text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Legenda:</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoMessage; 