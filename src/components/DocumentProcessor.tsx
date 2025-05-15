'use client';

import React, { useState } from 'react';
import { htmlToText, htmlToWord } from '../utils/wordProcessor';

interface DocumentProcessorProps {
  html: string;
  text: string;
  fileName: string;
}

const DocumentProcessor: React.FC<DocumentProcessorProps> = ({ html, text, fileName }) => {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Función para copiar el contenido HTML al portapapeles
  const copyToClipboard = async (contentType: 'html' | 'text') => {
    try {
      const content = contentType === 'html' ? html : text;
      await navigator.clipboard.writeText(content);
      setCopySuccess(`¡${contentType === 'html' ? 'HTML' : 'Texto'} copiado!`);
      
      // Resetear el mensaje después de 2 segundos
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
      setCopySuccess('Error al copiar');
    }
  };

  // Función para descargar el contenido como archivo
  const downloadAs = async (format: 'html' | 'text' | 'word') => {
    setIsExporting(true);
    
    try {
      let content: string | Blob;
      let mimeType: string;
      let fileExtension: string;
      
      switch (format) {
        case 'html':
          content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${fileName}</title>
</head>
<body>
${html}
</body>
</html>`;
          mimeType = 'text/html';
          fileExtension = 'html';
          break;
        
        case 'text':
          content = text;
          mimeType = 'text/plain';
          fileExtension = 'txt';
          break;
        
        case 'word':
          content = await htmlToWord(html);
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          fileExtension = 'docx';
          break;
      }
      
      // Crear un enlace para la descarga
      const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Obtener el nombre del archivo sin la extensión original
      const baseFileName = fileName.replace(/\.[^/.]+$/, '');
      
      link.href = url;
      link.download = `${baseFileName}_procesado.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full mt-6 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-800">
          Opciones de exportación
        </h2>
      </div>
      
      <div className="p-4">
        <div className="flex flex-wrap gap-3">
          {/* Botones para copiar */}
          <button
            onClick={() => copyToClipboard('html')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Copiar HTML
          </button>
          
          <button
            onClick={() => copyToClipboard('text')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Copiar texto plano
          </button>
          
          {/* Separador */}
          <div className="w-px h-8 bg-gray-300 self-center mx-2"></div>
          
          {/* Botones para descargar */}
          <button
            onClick={() => downloadAs('html')}
            disabled={isExporting}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50"
          >
            Descargar como HTML
          </button>
          
          <button
            onClick={() => downloadAs('text')}
            disabled={isExporting}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50"
          >
            Descargar como texto
          </button>
          
          <button
            onClick={() => downloadAs('word')}
            disabled={isExporting}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50"
          >
            Descargar como Word
          </button>
        </div>
        
        {copySuccess && (
          <div className="mt-3 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-md inline-block">
            {copySuccess}
          </div>
        )}
        
        {isExporting && (
          <div className="mt-3 flex items-center">
            <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Preparando archivo...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentProcessor;
