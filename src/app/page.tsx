'use client';

import React, { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import DocumentViewer from '@/components/DocumentViewer';
import DocumentProcessor from '@/components/DocumentProcessor';
import ErrorDisplay from '@/components/ErrorDisplay';
import WarningBanner from '@/components/WarningBanner';
import { processWordDocument } from '@/utils/wordProcessor';

export default function Home() {
  const [processedDocument, setProcessedDocument] = useState<{
    html: string;
    text: string;
    fileName: string;
    usedFallback?: boolean;
  } | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const handleFileLoaded = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setShowWarning(false);
    
    try {
      console.log("Procesando archivo:", file.name, file.type, file.size);
      
      // Verificar si el archivo tiene un tamaño adecuado
      if (file.size === 0) {
        throw new Error("El archivo está vacío y no puede ser procesado");
      }
      
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("El archivo es demasiado grande (máximo 10MB)");
      }
      
      const result = await processWordDocument(file);
      console.log("Resultado procesado:", {
        htmlLength: result.html?.length || 0,
        textLength: result.text?.length || 0
      });
      
      if (!result.html || result.html.trim() === '') {
        throw new Error("No se pudo extraer contenido del documento");
      }
      
      // Detectar si se usó el procesador alternativo
      const usedFallback = result.html.includes('extraído utilizando un método alternativo') || 
                           result.html.includes('extracted-content');
      
      setProcessedDocument({
        html: result.html,
        text: result.text,
        fileName: file.name,
        usedFallback
      });
      
      // Mostrar advertencia si se usó el procesador alternativo
      if (usedFallback) {
        setShowWarning(true);
      }
      
      console.log("Documento procesado establecido con éxito", usedFallback ? "(usando método alternativo)" : "");
    } catch (err) {
      console.error('Error processing document:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar el documento. Por favor, intenta con otro archivo.');
      setProcessedDocument(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-12 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Limpiador de Formato Word</h1>
          <p className="mt-2 text-gray-600">
            Carga un documento Word (.docx) para extraer su contenido manteniendo solo el formato básico
          </p>
        </div>
        
        <FileUploader onFileLoaded={handleFileLoaded} />
        
        {isProcessing && (
          <div className="mt-8 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Procesando documento...</p>
          </div>
        )}
        
        {error && (
          <ErrorDisplay 
            error={error} 
            onRetry={() => {
              setError(null);
              setProcessedDocument(null);
            }}
            showDetails={true}
          />
        )}
        
        {processedDocument && !isProcessing && (
          <>
            {showWarning && (
              <WarningBanner 
                message="El procesador principal tuvo dificultades para extraer correctamente el contenido del documento. Se está utilizando un método alternativo que podría no preservar todo el formato original."
                onDismiss={() => setShowWarning(false)}
              />
            )}
            
            <DocumentViewer 
              html={processedDocument.html} 
              fileName={processedDocument.fileName} 
            />
            
            <DocumentProcessor 
              html={processedDocument.html}
              text={processedDocument.text}
              fileName={processedDocument.fileName}
            />
          </>
        )}
        
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            Esta aplicación procesa documentos Word manteniendo enlaces, texto en negrita, cursiva y listas,
            mientras elimina otros estilos como fuentes, tamaños y colores.
          </p>
          <p className="mt-2">
            <a href="/test" className="text-blue-500 hover:underline">Crear documento de prueba con formato</a>
          </p>
        </footer>
      </div>
    </main>
  );
}
