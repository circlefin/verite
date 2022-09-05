import { ClaimFormat, ClaimFormatDesignation } from "../../types"

export function parseClaimFormat(d: ClaimFormatDesignation): ClaimFormat {
  if (!d) return ClaimFormat.JwtVc
  const keys = Object.keys(d)
  if (!keys) {
    return ClaimFormat.JwtVc
  }
  const formatProperty = Object.keys(d)[0]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((<any>Object).values(ClaimFormat).includes(formatProperty)) {
    return formatProperty as ClaimFormat
  } else {
    throw TypeError("Unsupported format")
  }
}
