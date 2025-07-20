import React, { useState } from 'react';
import { Mic, Clock, Eye, EyeOff, Volume2 } from 'lucide-react';

interface AudioMessageProps {
  transcription: string;
  isError?: boolean;
  timestamp?: string;
}

const AudioMessage: React.FC<AudioMessageProps> = ({ 
  transcription, 
  isError = false, 
  timestamp 
}) => {
  const [isTranscriptionVisible, setIsTranscriptionVisible] = useState(true);

  const toggleTranscription = () => {
    setIsTranscriptionVisible(!isTranscriptionVisible);
  };

  return (
    <div className="bg-gradient-to-r from-duomo-background to-duomo-background-light rounded-xl p-4 border border-duomo-primary/20 shadow-sm">
      {/* Header com ícone de microfone */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-duomo-primary/10 rounded-full p-2">
            <Mic size={16} className="text-duomo-primary" />
          </div>
          <div>
            <span className="text-sm font-medium text-duomo-text-dark">
              {isError ? 'Erro no áudio' : 'Mensagem de áudio'}
            </span>
            {timestamp && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Clock size={12} />
                {timestamp}
              </div>
            )}
          </div>
        </div>
        
        {/* Botão para mostrar/esconder transcrição */}
        <button
          onClick={toggleTranscription}
          className="flex items-center gap-1 px-3 py-1 bg-white/80 hover:bg-white rounded-lg transition-all duration-200 text-xs text-duomo-primary hover:text-duomo-primary-dark"
        >
          {isTranscriptionVisible ? (
            <>
              <EyeOff size={12} />
              Ocultar
            </>
          ) : (
            <>
              <Eye size={12} />
              Ver texto
            </>
          )}
        </button>
      </div>

      {/* Transcrição */}
      {isTranscriptionVisible && (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-duomo-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 size={14} className="text-duomo-primary" />
            <span className="text-xs font-medium text-duomo-primary-dark">
              {isError ? 'Erro:' : 'Transcrição:'}
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {transcription}
          </p>
        </div>
      )}
    </div>
  );
};

export default AudioMessage; 