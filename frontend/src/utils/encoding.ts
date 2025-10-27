/**
 * Encodes a string to base64, supporting Unicode characters
 *
 * This function handles Unicode characters (emojis, special characters, etc.)
 * that the native btoa() function cannot handle.
 *
 * @param str - The string to encode
 * @returns Base64 encoded string
 */
export function encodeBase64Unicode(str: string): string {
  try {
    // Use TextEncoder to convert string to UTF-8 bytes
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);

    // Convert bytes to binary string
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    // Encode binary string to base64
    return btoa(binary);
  } catch (error) {
    // Fallback to traditional method if TextEncoder fails
    return btoa(unescape(encodeURIComponent(str)));
  }
}

/**
 * Decodes a base64 string that was encoded with Unicode support
 *
 * @param base64 - The base64 string to decode
 * @returns Decoded string with Unicode characters preserved
 */
export function decodeBase64Unicode(base64: string): string {
  try {
    // Decode base64 to binary string
    const binary = atob(base64);

    // Convert binary string to bytes
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // Use TextDecoder to convert bytes to UTF-8 string
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  } catch (error) {
    // Fallback to traditional method if TextDecoder fails
    return decodeURIComponent(escape(atob(base64)));
  }
}
