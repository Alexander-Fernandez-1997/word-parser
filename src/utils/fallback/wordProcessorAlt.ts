'use client';

/**
 * Procesador de documentos alternativo que utiliza FileReader para leer el archivo
 * y un enfoque diferente para extraer el contenido. Este se utiliza como fallback
 * cuando el método principal (mammoth) falla.
 */

export async function processWordDocumentAlt(file: File): Promise<{ html: string; text: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target || !event.target.result) {
          throw new Error("No se pudo leer el archivo");
        }
        
        // Para archivos binarios como .docx, vamos a extraer texto significativo
        // sin incluir metadatos de la estructura interna del archivo
        let extractedText = '';
        if (typeof event.target.result === 'string') {
          extractedText = cleanDocxRawContent(event.target.result);
        } else if (event.target.result instanceof ArrayBuffer) {
          const textDecoder = new TextDecoder('utf-8');
          const textContent = textDecoder.decode(event.target.result);
          extractedText = cleanDocxRawContent(textContent);
        }
        
        // Si después de la limpieza no hay texto significativo, devolvemos un mensaje
        if (!extractedText || extractedText.trim() === '') {
          resolve({
            html: '<p>El documento parece estar vacío o no contiene texto legible.</p>',
            text: 'El documento parece estar vacío o no contiene texto legible.'
          });
        } else {
          // Formateamos el texto extraído para la visualización
          const formattedHtml = formatExtractedText(extractedText);
          
          resolve({
            html: formattedHtml,
            text: extractedText
          });
        }
      } catch (error) {
        console.error("Error en el procesador alternativo:", error);
        resolve({
          html: '<p>No se pudo procesar el contenido del documento.</p>',
          text: 'No se pudo procesar el contenido del documento.'
        });
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Error al leer el archivo"));
    };
    
    // Intentar leer como texto primero
    reader.readAsText(file);
  });
}

/**
 * Limpia el contenido raw de un archivo DOCX para extraer solo texto legible
 */
function cleanDocxRawContent(content: string): string {
  // Filtramos líneas que parecen ser referencias a archivos XML o metadata del DOCX
  const lines = content.split(/\\r?\\n/);
  
  const filteredLines = lines.filter(line => {
    // Excluir líneas que parecen ser nombres de archivos XML internos de DOCX
    const isXmlReference = /word\/[\w\.]+\.xml|Content_Types|rels|theme/.test(line);
    
    // Excluir líneas que parecen ser marcadores de archivo ZIP
    const isZipMarker = /PK\\x03\\x04|\\[Content_Types\\]\.xml|\\\_rels/.test(line);
    
    // Excluir líneas que tienen pocas palabras y muchos caracteres especiales (probablemente basura binaria)
    const hasTooManySpecialChars = (line.replace(/[a-zA-Z0-9\\s]/g, '').length / line.length) > 0.4;
    
    // Excluir líneas muy cortas o que contienen "word" y "xml" juntos (probablemente metadatos)
    const isLikelyMetadata = /word.*\.xml|xml.*word|settings\.xml|theme|fontTable|numbering/.test(line);
    
    return !(isXmlReference || isZipMarker || hasTooManySpecialChars || isLikelyMetadata);
  });
  
  // Unimos las líneas filtradas y hacemos más limpieza
  let cleanedText = filteredLines.join(' ')
    // Eliminar secuencias que parecen ser basura binaria
    .replace(/[^\\x20-\\x7E\\s]/g, ' ')
    // Eliminar espacios múltiples
    .replace(/\\s+/g, ' ')
    // Eliminar cualquier residuo de estructuras XML
    .replace(/<[^>]*>/g, '')
    .trim();
  
  // Intentamos extraer párrafos o frases completas
  const paragraphs = cleanedText.match(/[A-Z][^.!?]*[.!?]/g) || [];
  if (paragraphs.length > 0) {
    return paragraphs.join(' ');
  }
  
  // Si no encontramos párrafos, intentamos extraer palabras significativas (3+ letras)
  const words = cleanedText.match(/\\b[A-Za-z]{3,}\\b/g) || [];
  if (words.length > 5) {  // Solo si hay al menos 5 palabras significativas
    return words.join(' ');
  }
  
  // Si llegamos aquí, no pudimos extraer texto significativo
  return '';
}

/**
 * Formatea el texto extraído para la visualización
 */
function formatExtractedText(text: string): string {
  // Dividir el texto en párrafos (usando puntos como separadores)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  // Crear párrafos HTML
  const paragraphs = sentences.map(sentence => `<p>${sentence.trim()}</p>`);
  
  return `
    <div class="extracted-content">
      <div class="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p class="text-yellow-700 text-sm">
          <strong>Nota:</strong> Este documento ha sido procesado utilizando un método alternativo
          debido a que el procesador principal no pudo extraer correctamente el contenido.
          El formato puede no ser preciso.
        </p>
      </div>
      ${paragraphs.join('')}
    </div>
  `;
}
