import parsePhoneNumberFromString, {
  isValidPhoneNumber,
} from "libphonenumber-js/min"
import type { CountryCode } from "libphonenumber-js/min"

const DEFAULT_COUNTRY: CountryCode = "TZ"

/**
 * Normalizes a user- or API-supplied phone string to E.164 (+…).
 * Used when re-submitting numbers that may still be stored in local form (e.g. 07…).
 */
export function toE164Phone(
  phone: string,
  defaultCountry: CountryCode = DEFAULT_COUNTRY
): string | null {
  const trimmed = phone.trim()
  if (!trimmed) return null
  if (isValidPhoneNumber(trimmed)) return trimmed
  const parsed = parsePhoneNumberFromString(trimmed, defaultCountry)
  if (parsed?.isValid()) return parsed.number
  return null
}
