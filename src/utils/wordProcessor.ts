'use client';

import mammoth from 'mammoth';
import { processWordDocumentAlt } from './fallback/wordProcessorAlt';

// Función para depuración
function logWithSize(label: string, content: any) {
  console.log(
    label, 
    typeof content === 'string' ? `(length: ${content.length})` : content,
    typeof content === 'string' && content.length < 100 ? content : ''
  );
}

/**
 * Procesa un archivo DOCX usando mammoth y elimina los estilos no deseados
 * mientras conserva el formato básico como enlaces, negritas, cursivas y listas
 */
export async function processWordDocument(file: File): Promise<{ html: string; text: string }> {
  try {
    logWithSize("Procesando archivo", file.name);
    
    // Leer el archivo como ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    logWithSize("Tamaño de ArrayBuffer", arrayBuffer.byteLength);
    
    // Probar diferentes enfoques con mammoth en orden descendente de complejidad
    try {
      // 1. Primer intento: con opciones completas
      const options = {
        styleMap: [
          "p[style-name='Heading 1'] => h1",
          "p[style-name='Heading 2'] => h2", 
          "p[style-name='Heading 3'] => h3",
          "b => b",
          "i => i",
          "u => u",
          "a => a",
          "br => br",
          "ul => ul",
          "ol => ol",
          "li => li",
        ],
        includeDefaultStyleMap: true,
      };

      console.log("Intentando convertir con opciones completas...");
      const result = await mammoth.convertToHtml({ arrayBuffer }, options);
      
      // Verificar si obtuvimos resultados válidos
      if (result && typeof result.html === 'string' && result.html.trim() !== '') {
        console.log("Conversión exitosa con opciones completas");
        const textResult = await mammoth.extractRawText({ arrayBuffer });
        
        // Limpieza básica del HTML
        const cleanedHtml = result.html
          .replace(/style="[^"]*"/g, '')
          .replace(/class="[^"]*"/g, '')
          .replace(/id="[^"]*"/g, '');
        
        return { 
          html: cleanedHtml, 
          text: textResult.value || '' 
        };
      }
      
      // 2. Segundo intento: sin opciones personalizadas
      console.log("Primer intento fallido, intentando sin opciones personalizadas...");
      const simpleResult = await mammoth.convertToHtml({ arrayBuffer });
      
      if (simpleResult && typeof simpleResult.html === 'string' && simpleResult.html.trim() !== '') {
        console.log("Conversión exitosa sin opciones personalizadas");
        const textResult = await mammoth.extractRawText({ arrayBuffer });
        
        return { 
          html: simpleResult.html, 
          text: textResult.value || '' 
        };
      }
      
      // 3. Tercer intento: solo extracción de texto
      console.log("Segundo intento fallido, intentando solo extracción de texto...");
      const textOnlyResult = await mammoth.extractRawText({ arrayBuffer });
      
      if (textOnlyResult && textOnlyResult.value && textOnlyResult.value.trim() !== '') {
        console.log("Extracción de texto exitosa");
        // Convertir el texto plano a HTML básico
        const textAsHtml = textOnlyResult.value
          .split('\n')
          .map(line => line.trim())
          .filter(line => line !== '')
          .map(line => `<p>${line}</p>`)
          .join('');
        
        return { 
          html: textAsHtml, 
          text: textOnlyResult.value 
        };
      }
      
      // Si llegamos aquí, ninguno de los métodos de mammoth funcionó
      console.warn("Todos los intentos con mammoth fallaron, usando método alternativo");
      return processWordDocumentAlt(file);
      
    } catch (mammothError) {
      console.error("Error específico de mammoth, probando con método alternativo:", mammothError);
      // Si mammoth falla, probar con el método alternativo
      return processWordDocumentAlt(file);
    }
  } catch (error) {
    console.error('Error general al procesar documento, probando con método alternativo:', error);
    // Probar con método alternativo como último recurso
    try {
      return await processWordDocumentAlt(file);
    } catch (fallbackError) {
      console.error('Error en método alternativo:', fallbackError);
      // Devolver valores por defecto para evitar errores de UI
      return {
        html: '<p>Error al procesar el documento. El archivo podría estar dañado o tener un formato no compatible.</p>',
        text: 'Error al procesar el documento. El archivo podría estar dañado o tener un formato no compatible.'
      };
    }
  }
}

/**
 * Convierte el HTML limpio a formato de texto plano
 */
export function htmlToText(html: string): string {
  if (typeof window !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html || '';
    return tempDiv.textContent || tempDiv.innerText || '';
  }
  
  // Fallback simple para servidor
  return (html || '').replace(/<[^>]*>/g, '');
}

/**
 * Convierte el HTML limpio a un nuevo documento Word
 * Esta es una implementación básica
 */
export async function htmlToWord(html: string): Promise<Blob> {
  // Implementación simplificada
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Documento Procesado</title>
      </head>
      <body>
        ${html || ''}
      </body>
    </html>
  `;
  
  // Crear un Blob con el contenido HTML
  return new Blob([htmlContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}
