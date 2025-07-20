import React from 'react';
import { FileText, Download, FileIcon, Clock, Eye } from 'lucide-react';

interface DocumentMessageProps {
  fileName: string;
  fileSize?: string;
  fileType?: string;
  downloadUrl?: string;
  timestamp?: string;
  caption?: string;
}

const DocumentMessage: React.FC<DocumentMessageProps> = ({
  fileName,
  fileSize,
  fileType,
  downloadUrl,
  timestamp,
  caption
}) => {
  const getFileIcon = (type?: string) => {
    if (!type) return <FileIcon size={20} className="text-blue-600" />;
    
    if (type.includes('pdf')) return <FileText size={20} className="text-red-600" />;
    if (type.includes('doc') || type.includes('docx')) return <FileText size={20} className="text-blue-600" />;
    if (type.includes('xls') || type.includes('xlsx')) return <FileText size={20} className="text-green-600" />;
    if (type.includes('ppt') || type.includes('pptx')) return <FileText size={20} className="text-orange-600" />;
    
    return <FileIcon size={20} className="text-gray-600" />;
  };

  const getFileTypeColor = (type?: string) => {
    if (!type) return 'from-gray-50 to-gray-100 border-gray-200';
    
    if (type.includes('pdf')) return 'from-red-50 to-red-100 border-red-200';
    if (type.includes('doc') || type.includes('docx')) return 'from-blue-50 to-blue-100 border-blue-200';
    if (type.includes('xls') || type.includes('xlsx')) return 'from-green-50 to-green-100 border-green-200';
    if (type.includes('ppt') || type.includes('pptx')) return 'from-orange-50 to-orange-100 border-orange-200';
    
    return 'from-gray-50 to-gray-100 border-gray-200';
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={`bg-gradient-to-r ${getFileTypeColor(fileType)} rounded-xl p-4 border shadow-sm max-w-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-white/80 rounded-full p-2">
            {getFileIcon(fileType)}
          </div>
          <div>
            <span className="text-sm font-medium text-gray-800">
              Documento
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
        {downloadUrl && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1 bg-white/80 hover:bg-white rounded-lg transition-all duration-200 text-xs text-gray-600 hover:text-gray-800"
          >
            <Download size={12} />
            Baixar
          </button>
        )}
      </div>

      {/* Informações do arquivo */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={14} className="text-gray-600" />
          <span className="text-xs font-medium text-gray-700">Arquivo:</span>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-800 break-all">
            {fileName}
          </p>
          
          {fileSize && (
            <p className="text-xs text-gray-500">
              Tamanho: {fileSize}
            </p>
          )}
          
          {fileType && (
            <p className="text-xs text-gray-500">
              Tipo: {fileType}
            </p>
          )}
        </div>
      </div>

      {/* Legenda */}
      {caption && (
        <div className="mt-3 bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-white/50">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={14} className="text-gray-600" />
            <span className="text-xs font-medium text-gray-700">Legenda:</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentMessage; 