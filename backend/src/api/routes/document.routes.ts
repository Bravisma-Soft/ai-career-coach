import { Router, Request, Response } from 'express';
import { documentService } from '@/services/document.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess, sendPaginatedResponse } from '@/utils/response';
import { authenticate } from '@/api/middleware/auth.middleware';
import { validate } from '@/api/middleware/validate';
import {
  createDocumentSchema,
  getDocumentsQuerySchema,
  getDocumentSchema,
  deleteDocumentSchema,
  updateDocumentSchema,
  getJobDocumentsSchema,
} from '@/api/validators/document.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// =================================
// DOCUMENT ROUTES
// =================================

/**
 * @route   GET /api/v1/documents
 * @desc    Get all documents with filtering and pagination
 * @access  Private
 */
router.get(
  '/',
  validate(getDocumentsQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await documentService.getDocuments(req.query as any);

    sendPaginatedResponse(
      res,
      result.documents,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    );
  })
);

/**
 * @route   POST /api/v1/documents
 * @desc    Create a new document
 * @access  Private
 */
router.post(
  '/',
  validate(createDocumentSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const document = await documentService.createDocument(req.body);
    sendSuccess(res, { document }, 'Document created successfully', 201);
  })
);

/**
 * @route   GET /api/v1/documents/:id
 * @desc    Get document by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(getDocumentSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const document = await documentService.getDocumentById(id!);
    sendSuccess(res, { document }, 'Document retrieved successfully');
  })
);

/**
 * @route   PUT /api/v1/documents/:id
 * @desc    Update document
 * @access  Private
 */
router.put(
  '/:id',
  validate(updateDocumentSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const document = await documentService.updateDocument(id!, req.body);
    sendSuccess(res, { document }, 'Document updated successfully');
  })
);

/**
 * @route   DELETE /api/v1/documents/:id
 * @desc    Delete document
 * @access  Private
 */
router.delete(
  '/:id',
  validate(deleteDocumentSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await documentService.deleteDocument(id!);
    sendSuccess(res, null, 'Document deleted successfully');
  })
);

/**
 * @route   GET /api/v1/documents/job/:jobId
 * @desc    Get all documents for a specific job
 * @access  Private
 */
router.get(
  '/job/:jobId',
  validate(getJobDocumentsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const documents = await documentService.getJobDocuments(jobId!);
    sendSuccess(res, { documents }, 'Job documents retrieved successfully');
  })
);

export default router;
