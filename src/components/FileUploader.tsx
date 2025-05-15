'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploaderProps {
  onFileLoaded: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileLoaded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    // Verificar si hay algún archivo
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Registrar información sobre el archivo
      console.log("Archivo recibido:", {
        name: file.name,
        type: file.type || 'sin tipo detectado',
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString()
      });
      
      // Verificar si el archivo tiene la extensión .docx
      const isWordFile = file.name.toLowerCase().endsWith('.docx') || 
                        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      // Para pruebas, aceptar archivos sin tipo detectado si tienen la extensión .docx
      if (isWordFile) {
        setIsLoading(true);
        
        try {
          // Pasar el archivo al componente padre
          onFileLoaded(file);
        } catch (e) {
          console.error("Error al cargar el archivo:", e);
          setError('Error al procesar el archivo: ' + (e instanceof Error ? e.message : String(e)));
        } finally {
          setIsLoading(false);
        }
      } else {
        console.warn("Tipo de archivo no soportado:", file.type, "Nombre:", file.name);
        setError(`Por favor, carga un archivo Word (.docx). Archivo recibido: ${file.name} (${file.type || 'tipo no detectado'})`);
      }
    } else {
      console.log("No se recibieron archivos");
    }
  }, [onFileLoaded]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/octet-stream': ['.docx'], // Para archivos sin tipo detectado pero con extensión .docx
    },
    maxFiles: 1,
    maxSize: 10485760, // 10MB
    validator: (file) => {
      // Verificar si el archivo tiene la extensión .docx
      if (!file.name.toLowerCase().endsWith('.docx')) {
        return {
          code: 'file-invalid-type',
          message: 'Solo se permiten archivos .docx'
        };
      }
      return null;
    }
  });

  // Mostrar errores de rechazo de archivos
  React.useEffect(() => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      const errorCode = rejection.errors[0]?.code;
      let errorMessage = '';
      
      switch (errorCode) {
        case 'file-too-large':
          errorMessage = 'El archivo es demasiado grande (máximo 10MB)';
          break;
        case 'file-invalid-type':
          errorMessage = 'Solo se permiten archivos Word (.docx)';
          break;
        default:
          errorMessage = `Error al cargar el archivo: ${rejection.errors[0]?.message || 'desconocido'}`;
      }
      
      setError(errorMessage);
    }
  }, [fileRejections]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        {...getRootProps()} 
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
                   ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-sm text-gray-600">Procesando archivo...</p>
          </div>
        ) : (
          <div>
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive ? 
                "Suelta el archivo aquí..." : 
                "Arrastra y suelta un archivo Word o haz clic para seleccionarlo"
              }
            </p>
            
            <p className="mt-1 text-xs text-gray-500">
              Solo archivos .docx (máx. 10MB)
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
