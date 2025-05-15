'use client';

import React from 'react';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  showDetails?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry, showDetails = false }) => {
  const [showMoreDetails, setShowMoreDetails] = React.useState(false);
  
  return (
    <div className="w-full mt-8 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg 
            className="h-6 w-6 text-red-500" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        
        <div className="ml-3">
          <h3 className="text-lg font-medium text-red-800">
            Error al procesar el documento
          </h3>
          
          <div className="mt-2 text-sm text-red-700">
            <p>{error}</p>
            
            {showDetails && (
              <button 
                onClick={() => setShowMoreDetails(!showMoreDetails)}
                className="mt-2 text-red-600 hover:text-red-800 underline text-xs"
              >
                {showMoreDetails ? 'Ocultar detalles técnicos' : 'Mostrar detalles técnicos'}
              </button>
            )}
          </div>
          
          {showMoreDetails && (
            <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono whitespace-pre-wrap text-red-800">
              Error: El procesador de documentos no pudo extraer contenido del archivo.
              <br />
              Causa posible: El archivo podría estar dañado o tener un formato incompatible.
            </div>
          )}
          
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Intentar con otro archivo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
