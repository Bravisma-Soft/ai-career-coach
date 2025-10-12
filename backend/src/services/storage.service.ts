import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import AWS from 'aws-sdk';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { InternalServerError, NotFoundError } from '@/utils/ApiError';

export interface UploadedFile {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  key: string;
}

export interface StorageConfig {
  provider: 'local' | 's3';
  localPath?: string;
  s3Bucket?: string;
}

export class StorageService {
  private config: StorageConfig;
  private s3?: AWS.S3;
  private localUploadPath: string;

  constructor() {
    // Determine storage provider based on environment
    this.config = {
      provider: env.AWS_S3_BUCKET_NAME ? 's3' : 'local',
      localPath: path.join(process.cwd(), 'uploads'),
      s3Bucket: env.AWS_S3_BUCKET_NAME,
    };

    // Initialize S3 if configured
    if (this.config.provider === 's3') {
      this.s3 = new AWS.S3({
        region: env.AWS_REGION,
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      });
      logger.info('Storage: Using AWS S3');
    } else {
      this.localUploadPath = this.config.localPath || path.join(process.cwd(), 'uploads');
      logger.info(`Storage: Using local filesystem at ${this.localUploadPath}`);
    }
  }

  /**
   * Upload a file to storage
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'files'
  ): Promise<UploadedFile> {
    try {
      const fileName = this.generateFileName(file.originalname);
      const key = `${folder}/${fileName}`;

      if (this.config.provider === 's3') {
        return await this.uploadToS3(file, key);
      } else {
        return await this.uploadToLocal(file, key);
      }
    } catch (error) {
      logger.error('File upload failed:', error);
      throw new InternalServerError('Failed to upload file');
    }
  }

  /**
   * Upload file to S3
   */
  private async uploadToS3(
    file: Express.Multer.File,
    key: string
  ): Promise<UploadedFile> {
    if (!this.s3 || !this.config.s3Bucket) {
      throw new InternalServerError('S3 not configured');
    }

    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.config.s3Bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private', // Change to 'public-read' if you want public access
    };

    await this.s3.upload(params).promise();

    const fileUrl = `https://${this.config.s3Bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

    logger.info(`File uploaded to S3: ${key}`);

    return {
      fileName: file.originalname,
      fileUrl,
      fileSize: file.size,
      mimeType: file.mimetype,
      key,
    };
  }

  /**
   * Upload file to local filesystem
   */
  private async uploadToLocal(
    file: Express.Multer.File,
    key: string
  ): Promise<UploadedFile> {
    const filePath = path.join(this.localUploadPath, key);
    const directory = path.dirname(filePath);

    // Create directory if it doesn't exist
    await fs.mkdir(directory, { recursive: true });

    // Write file
    await fs.writeFile(filePath, file.buffer);

    // Generate URL (assuming files are served from /uploads route)
    const fileUrl = `/uploads/${key}`;

    logger.info(`File uploaded locally: ${key}`);

    return {
      fileName: file.originalname,
      fileUrl,
      fileSize: file.size,
      mimeType: file.mimetype,
      key,
    };
  }

  /**
   * Download file from storage
   */
  async downloadFile(key: string): Promise<Buffer> {
    try {
      if (this.config.provider === 's3') {
        return await this.downloadFromS3(key);
      } else {
        return await this.downloadFromLocal(key);
      }
    } catch (error) {
      logger.error('File download failed:', error);
      throw new NotFoundError('File not found');
    }
  }

  /**
   * Download file from S3
   */
  private async downloadFromS3(key: string): Promise<Buffer> {
    if (!this.s3 || !this.config.s3Bucket) {
      throw new InternalServerError('S3 not configured');
    }

    const params: AWS.S3.GetObjectRequest = {
      Bucket: this.config.s3Bucket,
      Key: key,
    };

    const result = await this.s3.getObject(params).promise();

    if (!result.Body) {
      throw new NotFoundError('File not found');
    }

    return result.Body as Buffer;
  }

  /**
   * Download file from local filesystem
   */
  private async downloadFromLocal(key: string): Promise<Buffer> {
    const filePath = path.join(this.localUploadPath, key);

    try {
      return await fs.readFile(filePath);
    } catch (error) {
      throw new NotFoundError('File not found');
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(key: string): Promise<void> {
    try {
      if (this.config.provider === 's3') {
        await this.deleteFromS3(key);
      } else {
        await this.deleteFromLocal(key);
      }

      logger.info(`File deleted: ${key}`);
    } catch (error) {
      logger.error('File deletion failed:', error);
      throw new InternalServerError('Failed to delete file');
    }
  }

  /**
   * Delete file from S3
   */
  private async deleteFromS3(key: string): Promise<void> {
    if (!this.s3 || !this.config.s3Bucket) {
      throw new InternalServerError('S3 not configured');
    }

    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: this.config.s3Bucket,
      Key: key,
    };

    await this.s3.deleteObject(params).promise();
  }

  /**
   * Delete file from local filesystem
   */
  private async deleteFromLocal(key: string): Promise<void> {
    const filePath = path.join(this.localUploadPath, key);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Generate signed URL for private S3 files
   */
  async generateSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (this.config.provider === 's3') {
      if (!this.s3 || !this.config.s3Bucket) {
        throw new InternalServerError('S3 not configured');
      }

      const params = {
        Bucket: this.config.s3Bucket,
        Key: key,
        Expires: expiresIn, // URL valid for 1 hour
      };

      return this.s3.getSignedUrlPromise('getObject', params);
    } else {
      // For local storage, return the regular URL
      return `/uploads/${key}`;
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      if (this.config.provider === 's3') {
        if (!this.s3 || !this.config.s3Bucket) {
          return false;
        }

        const params: AWS.S3.HeadObjectRequest = {
          Bucket: this.config.s3Bucket,
          Key: key,
        };

        await this.s3.headObject(params).promise();
        return true;
      } else {
        const filePath = path.join(this.localUploadPath, key);
        await fs.access(filePath);
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate unique filename
   */
  private generateFileName(originalName: string): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${randomString}${ext}`;
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key: string): Promise<{ size: number; contentType: string }> {
    if (this.config.provider === 's3') {
      if (!this.s3 || !this.config.s3Bucket) {
        throw new InternalServerError('S3 not configured');
      }

      const params: AWS.S3.HeadObjectRequest = {
        Bucket: this.config.s3Bucket,
        Key: key,
      };

      const result = await this.s3.headObject(params).promise();

      return {
        size: result.ContentLength || 0,
        contentType: result.ContentType || 'application/octet-stream',
      };
    } else {
      const filePath = path.join(this.localUploadPath, key);
      const stats = await fs.stat(filePath);

      return {
        size: stats.size,
        contentType: 'application/octet-stream', // Would need mime-types package for accurate detection
      };
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
