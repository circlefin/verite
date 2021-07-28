import { NextApiHandler, NextApiResponse } from "next"
import { ValidationError, ValidationFailure } from "types"

export type ApiErrorResponse = {
  status: number
  message: string
  errors?: ValidationFailure[]
}

export type ApiResponse<T> = NextApiResponse<T | ApiErrorResponse>

export function apiError(
  res: NextApiResponse<ApiErrorResponse>,
  status: number,
  message: string,
  errors?: ValidationFailure[]
): void {
  res.status(status).json({
    status,
    message,
    errors
  })
}

export function notFound(res: NextApiResponse<ApiErrorResponse>): void {
  apiError(res, 404, "Not found")
}

export function methodNotAllowed(res: NextApiResponse<ApiErrorResponse>): void {
  apiError(res, 405, "Method not allowed")
}

export function validationError(
  res: NextApiResponse<ApiErrorResponse>,
  error: Error
): void {
  if (error instanceof ValidationError) {
    apiError(res, 400, error.message, error.failures)
  } else {
    apiError(res, 400, error.message)
  }
}

/**
 * Wrapper for API requests which handles API Errors and basic logging
 */
export function apiHandler<T>(
  handler: NextApiHandler<T | ApiErrorResponse>
): NextApiHandler<T | ApiErrorResponse> {
  return async (req, res) => {
    if (process.env.NODE_ENV !== "test") {
      console.info(`> ${req.method} ${req.url}`)
    }

    return handler(req, res)
  }
}
