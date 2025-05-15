'use client';

import React, { useState, useEffect } from 'react';

export default function TestPage() {
  const [htmlContent, setHtmlContent] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Cargar el contenido HTML del archivo
    fetch('/documento_prueba.html')
      .then(response => response.text())
      .then(text => {
        setHtmlContent(text);
      })
      .catch(error => {
        console.error('Error al cargar el HTML de prueba:', error);
      });
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(htmlContent)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Error al copiar al portapapeles:', err);
      });
  };

  const downloadAsHtml = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documento_prueba.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-6 md:p-12 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Documento de Prueba con Formato</h1>
          <p className="mt-2 text-gray-600">
            Usa este documento para probar la aplicación de limpieza de formato
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Instrucciones:</h2>
          <ol className="list-decimal pl-6 space-y-2 text-gray-700">
            <li>Copia el HTML haciendo clic en el botón "Copiar HTML"</li>
            <li>Descarga el HTML para abrirlo en Word haciendo clic en "Descargar como HTML"</li>
            <li>Para crear un archivo .docx:
              <ul className="list-disc pl-6 mt-2 mb-2">
                <li>Abre Microsoft Word</li>
                <li>Crea un nuevo documento</li>
                <li>Pega el HTML que copiaste (Ctrl+V o Cmd+V)</li>
                <li>Guarda el documento como .docx</li>
              </ul>
            </li>
            <li>Alternativamente, abre el HTML descargado con Microsoft Word y guárdalo como .docx</li>
            <li>Usa este archivo .docx para probar la aplicación de limpieza de formato</li>
          </ol>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-semibold">Vista previa:</h2>
            <div className="space-x-3">
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {copied ? "¡Copiado!" : "Copiar HTML"}
              </button>
              <button
                onClick={downloadAsHtml}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
              >
                Descargar como HTML
              </button>
            </div>
          </div>

          <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm">
            <strong>Nota:</strong> Este contenido HTML incluye varios formatos como negrita, cursiva, enlaces,
            listas ordenadas y no ordenadas, diferentes colores y tamaños de texto. Al procesar este
            documento con la aplicación de limpieza de formato, debería mantener solo los formatos básicos
            como enlaces, negrita, cursiva y listas.
          </p>
        </div>
      </div>
    </div>
  );
}
