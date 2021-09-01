import { promisify } from "util"
import { ValidationError, VerificationError } from "@centre/verity"
import Cors from "cors"
import { NextApiHandler, NextApiRequest } from "next"
import { MethodNotAllowedError } from "./errors"

const cors = promisify(
  Cors({
    methods: ["GET", "HEAD"]
  })
)

type ApiError = {
  message: string
  details?: string
}

type ApiErrorResponse = {
  status: number
  errors: ApiError[]
}

type AnyError = Error & {
  status?: number
  details?: string
}

/**
 * Require a certain method to be used in for an API route
 */
export function requireMethod(req: NextApiRequest, method: string): void {
  if (req.method.toLowerCase() !== method.toLowerCase()) {
    throw new MethodNotAllowedError(`Only ${method} requests are allowed`)
  }
}

/**
 * Wrapper for API requests which handles API Errors and includes basic logging
 *
 * @remark This method is a wrapper around your existing api handler
 *
 * @example
 * export default apiHandler(async (req, res) => { ... })
 * export default apiHandler<ResponseType>(async (req, res) => { ... })
 */
export function apiHandler<T>(
  handler: NextApiHandler<T | ApiErrorResponse>
): NextApiHandler<T | ApiErrorResponse> {
  return async (req, res) => {
    await cors(req, res)

    // Log the HTTP request, but not in test environments
    if (process.env.NODE_ENV === "development") {
      console.info(`> ${req.method} ${req.url}`)
    }

    try {
      // Call the original API method
      await handler(req, res)
    } catch (e) {
      if (process.env.NODE_ENV !== "test") {
        console.error(e)
      }
      const status = errorStatusCode(e)
      res.status(status).json(apiError(e))
    }
  }
}

function apiError(error: AnyError): ApiErrorResponse {
  return {
    status: errorStatusCode(error),
    errors: [
      {
        message: error.message || "Something went wrong",
        details: error.details
      }
    ]
  }
}

function errorStatusCode(error: AnyError): number {
  if (error.status) {
    return error.status
  }

  if (error instanceof VerificationError || error instanceof ValidationError) {
    return 400
  }

  return 500
}
