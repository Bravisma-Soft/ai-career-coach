import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '@/types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  error: string,
  statusCode = 500,
  message?: string
): Response => {
  const response: ApiResponse = {
    success: false,
    error,
    message: message || error,
  };
  return res.status(statusCode).json(response);
};

export const sendPaginatedResponse = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  statusCode = 200
): Response => {
  const totalPages = Math.ceil(total / limit);
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
  };
  return res.status(statusCode).json(response);
};
