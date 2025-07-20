import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

interface ImagePreviewProps {
  file: File;
  onRemove: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ file, onRemove }) => {
  const imageUrl = URL.createObjectURL(file);

  return (
    <div className="relative inline-block">
      <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-brand-purple/20 bg-gray-50">
        <img
          src={imageUrl}
          alt="Preview"
          className="w-full h-full object-cover"
        />
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
        >
          <X size={12} />
        </button>
      </div>
      <div className="mt-1 text-xs text-gray-500 truncate max-w-20">
        {file.name}
      </div>
    </div>
  );
};

export default ImagePreview;