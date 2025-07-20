import React, { useState } from 'react';
import { Image as ImageIcon, Download, Eye, X, Clock, ZoomIn } from 'lucide-react';

interface ImageMessageProps {
  imageUrl: string;
  caption?: string;
  fileName?: string;
  timestamp?: string;
  fileSize?: string;
}

const ImageMessage: React.FC<ImageMessageProps> = ({ 
  imageUrl, 
  caption, 
  fileName,
  timestamp,
  fileSize
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName || 'image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (imageError) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200/50 shadow-sm max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-full p-2">
              <ImageIcon size={16} className="text-green-600" />
            </div>
            <div>
              <span className="text-sm font-medium text-green-800">
                Imagem não disponível
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
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon size={14} className="text-green-600" />
            <span className="text-xs font-medium text-green-700">Arquivo de imagem:</span>
          </div>
          <p className="text-sm text-gray-700 break-all">
            {fileName || 'Arquivo de imagem'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200/50 shadow-sm max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-full p-2">
              <ImageIcon size={16} className="text-green-600" />
            </div>
            <div>
              <span className="text-sm font-medium text-green-800">
                Imagem
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
            className="flex items-center gap-1 px-3 py-1 bg-white/80 hover:bg-white rounded-lg transition-all duration-200 text-xs text-green-600 hover:text-green-800"
          >
            <Download size={12} />
            Baixar
          </button>
        </div>

        {/* Visualização da imagem */}
        <div className="relative mb-3">
          <div className="relative group cursor-pointer overflow-hidden rounded-lg" onClick={() => setIsModalOpen(true)}>
            <img
              src={imageUrl}
              alt={fileName || 'Imagem enviada'}
              className="w-full h-auto rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ZoomIn size={20} className="text-gray-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Informações do arquivo */}
        {(fileName || fileSize) && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-green-100 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon size={14} className="text-green-600" />
              <span className="text-xs font-medium text-green-700">Detalhes:</span>
            </div>
            <div className="space-y-1">
              {fileName && (
                <p className="text-xs text-gray-700 break-all">
                  {fileName}
                </p>
              )}
              {fileSize && (
                <p className="text-xs text-gray-500">
                  Tamanho: {fileSize}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Legenda */}
        {caption && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={14} className="text-green-600" />
              <span className="text-xs font-medium text-green-700">Legenda:</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {caption}
            </p>
          </div>
        )}
      </div>

      {/* Modal para visualização em tela cheia */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={imageUrl}
              alt={fileName || 'Imagem enviada'}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-75 transition-colors"
            >
              <X size={20} />
            </button>
            {/* Informações na modal */}
            {(fileName || caption) && (
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-3">
                <div className="text-white">
                  {fileName && (
                    <p className="text-sm font-medium mb-1">
                      {fileName}
                    </p>
                  )}
                  {caption && (
                    <p className="text-xs text-gray-200">
                      {caption}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageMessage;