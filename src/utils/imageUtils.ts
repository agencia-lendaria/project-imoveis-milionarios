/**
 * Converts an image file to Base64 string
 * @param file Image file to convert
 * @returns Promise that resolves with Base64 string (without data URL prefix)
 */
export const imageFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64String = result.split(',')[1];
        resolve(base64String);
      } catch (error) {
        reject(new Error('Erro ao processar a imagem'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo de imagem'));
    };
    
    // Read the file as data URL (which includes the base64 data)
    reader.readAsDataURL(file);
  });
};

/**
 * Validates if a file is a valid image
 * @param file File to validate
 * @returns boolean indicating if file is a valid image
 */
export const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
};

/**
 * Gets the MIME type from a base64 string
 * @param base64 Base64 string
 * @returns MIME type or null if not found
 */
export const getMimeTypeFromBase64 = (base64: string): string | null => {
  // Check for common image signatures in base64
  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('iVBORw0KGgo')) return 'image/png';
  if (base64.startsWith('R0lGODlh')) return 'image/gif';
  if (base64.startsWith('UklGR')) return 'image/webp';
  
  return null;
};