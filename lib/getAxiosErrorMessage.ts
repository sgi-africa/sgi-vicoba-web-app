import type { AxiosError } from "axios"

function normalizeMessageField(message: unknown): string {
  if (typeof message === "string") return message.trim()
  if (Array.isArray(message)) {
    const parts = message.filter((m): m is string => typeof m === "string")
    return parts.join(", ").trim()
  }
  return ""
}

/** Reads Nest-style and similar JSON error bodies from axios error response data. */
export function parseApiErrorBody(data: unknown): string {
  if (data == null) return ""

  if (typeof Buffer !== "undefined" && Buffer.isBuffer(data)) {
    return parseApiErrorBody(data.toString("utf8"))
  }

  if (typeof data === "string") {
    const trimmed = data.trim()
    if (!trimmed) return ""
    try {
      return normalizeMessageField((JSON.parse(trimmed) as { message?: unknown }).message)
    } catch {
      return trimmed
    }
  }

  if (typeof data === "object") {
    return normalizeMessageField((data as { message?: unknown }).message)
  }

  return ""
}

/** User-visible message from a failed axios request (prefers API `message` field). */
export function getAxiosErrorUserMessage(error: AxiosError): string {
  const fromBody = parseApiErrorBody(error.response?.data)
  if (fromBody) return fromBody

  const status = error.response?.status
  if (status != null) return `Request failed with status code ${status}`

  return error.message?.trim() || ""
}
