import { promisify } from "util"
import {
  ValidationError,
  ValidationFailure,
  VerificationError
} from "@centre/verity"
import Cors from "cors"
import { NextApiHandler, NextApiRequest } from "next"
import { MethodNotAllowedError, ProcessingError } from "./errors"

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
  failures?: ValidationFailure[]
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
    if (process.env.NODE_ENV !== "test") {
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
  if (error instanceof ProcessingError) {
    return {
      status: error.status,
      errors: error.failures.map((failure) => {
        return {
          message: failure.message,
          details: failure.details
        }
      })
    }
  } else {
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

/**
 * Helper function to create a URL with the NGROK_HOST if given, otherwise the
 * default HOST. Implementation uses the NEXT_PUBLIC_ prefix so they are
 * available in both the server and client environments.
 *
 * Used for debugging purposes, this function is intended to be used for URLs
 * used in Verifiable Credentials, Revocation URLs, QR Codes, etc to aid in
 * routing traffic to a host. This allows us to tunnel traffic from a mobile
 * identity wallet to the service runnong on localhost using ngrok.
 *
 * @param path of the route
 * @returns A url with the NGROK_HOST as host if given, otherwise uses the
 * default HOST env variable.
 */
export function publicUrl(path: string): string {
  if (process.env.NEXT_PUBLIC_NGROK_HOST) {
    return `${process.env.NEXT_PUBLIC_NGROK_HOST}${path}`
  }

  return `${process.env.NEXT_PUBLIC_HOST}${path}`
}
