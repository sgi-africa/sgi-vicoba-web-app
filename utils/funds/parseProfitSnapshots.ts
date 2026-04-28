import { ProfitSnapshot } from "@/interfaces/interface"

/** Pick snapshot rows from typical API wrappers (arrays, `{ data }`, nested payloads, single row). */
export function parseProfitSnapshotList(raw: unknown, depth = 0): ProfitSnapshot[] {
  if (depth > 6) return []
  if (raw == null) return []
  if (Array.isArray(raw)) return raw as ProfitSnapshot[]

  if (typeof raw !== "object") return []

  const o = raw as Record<string, unknown>

  const arrayKeys = [
    "snapshots",
    "data",
    "items",
    "results",
    "result",
    "records",
    "payload",
    "body",
    "content",
    "profitSnapshots",
    "disbursementSnapshots",
    "disbursementSnapshotList",
    "snapshotList",
    "rows",
  ]

  for (const key of arrayKeys) {
    const v = o[key]
    if (Array.isArray(v)) return v as ProfitSnapshot[]
  }

  // Nested objects (e.g. { data: { snapshots: [...] } })
  for (const key of arrayKeys) {
    const v = o[key]
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const inner = parseProfitSnapshotList(v, depth + 1)
      if (inner.length > 0) return inner
    }
  }

  // Single snapshot row (endpoint may return one object instead of `[one]`)
  if (
    "executedAt" in o &&
    ("totalProfit" in o || "payouts" in o || "profitWindowEnd" in o)
  ) {
    return [o as unknown as ProfitSnapshot]
  }

  return []
}
