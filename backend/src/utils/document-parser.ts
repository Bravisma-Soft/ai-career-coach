import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { logger } from '@/config/logger';
import { InternalServerError, BadRequestError } from '@/utils/ApiError';

/**
 * Document Parser Utility
 *
 * Extract text from PDF and DOCX files
 */

export interface DocumentParseResult {
  text: string;
  pageCount?: number;
  wordCount: number;
  metadata?: {
    title?: string;
    author?: string;
    creationDate?: Date;
    [key: string]: any;
  };
}

export class DocumentParser {
  /**
   * Extract text from PDF buffer
   */
  static async extractTextFromPDF(buffer: Buffer): Promise<DocumentParseResult> {
    try {
      logger.info('Extracting text from PDF', {
        size: buffer.length,
      });

      const data = await pdf(buffer);

      const text = data.text;
      const wordCount = text.split(/\s+/).filter((word) => word.length > 0).length;

      logger.info('PDF text extraction complete', {
        pages: data.numpages,
        wordCount,
        textLength: text.length,
      });

      return {
        text: text.trim(),
        pageCount: data.numpages,
        wordCount,
        metadata: {
          title: data.info?.Title,
          author: data.info?.Author,
          creationDate: data.info?.CreationDate
            ? new Date(data.info.CreationDate)
            : undefined,
          producer: data.info?.Producer,
        },
      };
    } catch (error) {
      logger.error('PDF text extraction failed', { error });
      throw new InternalServerError('Failed to extract text from PDF file');
    }
  }

  /**
   * Extract text from DOCX buffer
   */
  static async extractTextFromDOCX(buffer: Buffer): Promise<DocumentParseResult> {
    try {
      logger.info('Extracting text from DOCX', {
        size: buffer.length,
      });

      const result = await mammoth.extractRawText({ buffer });

      const text = result.value;
      const wordCount = text.split(/\s+/).filter((word) => word.length > 0).length;

      // Check for messages/warnings
      if (result.messages.length > 0) {
        logger.warn('DOCX extraction warnings', {
          messages: result.messages,
        });
      }

      logger.info('DOCX text extraction complete', {
        wordCount,
        textLength: text.length,
        warnings: result.messages.length,
      });

      return {
        text: text.trim(),
        wordCount,
        metadata: {
          warnings: result.messages,
        },
      };
    } catch (error) {
      logger.error('DOCX text extraction failed', { error });
      throw new InternalServerError('Failed to extract text from DOCX file');
    }
  }

  /**
   * Extract text from DOC (legacy Word format) buffer
   * Note: DOC support is limited, conversion to DOCX is recommended
   */
  static async extractTextFromDOC(buffer: Buffer): Promise<DocumentParseResult> {
    // mammoth can handle .doc files to some extent
    return this.extractTextFromDOCX(buffer);
  }

  /**
   * Extract text from TXT buffer
   */
  static async extractTextFromTXT(buffer: Buffer): Promise<DocumentParseResult> {
    try {
      const text = buffer.toString('utf-8');
      const wordCount = text.split(/\s+/).filter((word) => word.length > 0).length;

      logger.info('TXT text extraction complete', {
        wordCount,
        textLength: text.length,
      });

      return {
        text: text.trim(),
        wordCount,
      };
    } catch (error) {
      logger.error('TXT text extraction failed', { error });
      throw new InternalServerError('Failed to extract text from TXT file');
    }
  }

  /**
   * Auto-detect file type and extract text
   */
  static async extractText(
    buffer: Buffer,
    mimeType?: string,
    fileName?: string
  ): Promise<DocumentParseResult> {
    // Determine file type
    let fileType: 'pdf' | 'docx' | 'doc' | 'txt' | null = null;

    if (mimeType) {
      if (mimeType === 'application/pdf') {
        fileType = 'pdf';
      } else if (
        mimeType ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/vnd.ms-word.document.macroEnabled.12'
      ) {
        fileType = 'docx';
      } else if (mimeType === 'application/msword') {
        fileType = 'doc';
      } else if (mimeType === 'text/plain') {
        fileType = 'txt';
      }
    }

    // Fallback to file extension
    if (!fileType && fileName) {
      const ext = fileName.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') fileType = 'pdf';
      else if (ext === 'docx') fileType = 'docx';
      else if (ext === 'doc') fileType = 'doc';
      else if (ext === 'txt') fileType = 'txt';
    }

    if (!fileType) {
      throw new BadRequestError(
        'Unsupported file type. Supported formats: PDF, DOCX, DOC, TXT'
      );
    }

    logger.info('Auto-detected file type', { fileType, mimeType, fileName });

    // Extract based on type
    switch (fileType) {
      case 'pdf':
        return this.extractTextFromPDF(buffer);
      case 'docx':
        return this.extractTextFromDOCX(buffer);
      case 'doc':
        return this.extractTextFromDOC(buffer);
      case 'txt':
        return this.extractTextFromTXT(buffer);
      default:
        throw new BadRequestError(`Unsupported file type: ${fileType}`);
    }
  }

  /**
   * Clean extracted text
   */
  static cleanText(text: string): string {
    return (
      text
        // Remove multiple spaces
        .replace(/\s+/g, ' ')
        // Remove multiple newlines
        .replace(/\n{3,}/g, '\n\n')
        // Remove special characters that may interfere
        .replace(/[\x00-\x1F\x7F]/g, '')
        // Trim
        .trim()
    );
  }

  /**
   * Validate extracted text
   */
  static validateText(text: string): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (!text || text.trim().length === 0) {
      issues.push('Extracted text is empty');
    }

    if (text.length < 100) {
      issues.push('Extracted text is too short (less than 100 characters)');
    }

    const wordCount = text.split(/\s+/).filter((word) => word.length > 0).length;
    if (wordCount < 20) {
      issues.push('Extracted text has too few words (less than 20)');
    }

    // Check if text seems corrupted (too many special characters)
    const specialCharRatio =
      (text.match(/[^a-zA-Z0-9\s.,;:!?()\-]/g) || []).length / text.length;
    if (specialCharRatio > 0.3) {
      issues.push('Text may be corrupted (high ratio of special characters)');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Extract metadata from document
   */
  static async extractMetadata(
    buffer: Buffer,
    mimeType?: string
  ): Promise<Record<string, any>> {
    try {
      if (mimeType === 'application/pdf') {
        const data = await pdf(buffer);
        return {
          pages: data.numpages,
          info: data.info,
          metadata: data.metadata,
        };
      }

      return {};
    } catch (error) {
      logger.error('Metadata extraction failed', { error });
      return {};
    }
  }

  /**
   * Get text statistics
   */
  static getTextStats(text: string): {
    characters: number;
    words: number;
    lines: number;
    sentences: number;
  } {
    const lines = text.split('\n').length;
    const words = text.split(/\s+/).filter((word) => word.length > 0).length;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;

    return {
      characters: text.length,
      words,
      lines,
      sentences,
    };
  }
}

// Export convenience functions
export const extractTextFromPDF = DocumentParser.extractTextFromPDF.bind(DocumentParser);
export const extractTextFromDOCX = DocumentParser.extractTextFromDOCX.bind(DocumentParser);
export const extractText = DocumentParser.extractText.bind(DocumentParser);
export const cleanText = DocumentParser.cleanText.bind(DocumentParser);
export const validateText = DocumentParser.validateText.bind(DocumentParser);
