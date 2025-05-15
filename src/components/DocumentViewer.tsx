'use client';

import React from 'react';

interface DocumentViewerProps {
  html: string;
  fileName: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ html, fileName }) => {
  // Comprobar si el HTML está vacío o es undefined
  const hasContent = html && html.trim() !== '';
  
  return (
    <div className="w-full mt-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="text-lg font-medium text-gray-800">
            Vista previa: {fileName || 'Documento'}
          </h2>
        </div>
        
        <div className="p-6">
          {hasContent ? (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: html }} 
            />
          ) : (
            <div className="py-4 text-gray-500 italic">
              No se pudo extraer contenido del documento o el documento está vacío.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
