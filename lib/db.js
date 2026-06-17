import { neon } from '@neondatabase/serverless'

let sqlClient = null

export function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING
  )
}

export function getSql() {
  if (!sqlClient) {
    const databaseUrl = getDatabaseUrl()
    if (!databaseUrl) {
      throw new Error(
        'Missing database URL. Expected DATABASE_URL, POSTGRES_URL, POSTGRES_PRISMA_URL, or POSTGRES_URL_NON_POOLING.'
      )
    }
    sqlClient = neon(databaseUrl)
  }
  return sqlClient
}

export function normalizeClaim(claim) {
  return claim
    .toLowerCase()
    .trim()
    .replace(/^they say\s+/i, '')
    .replace(/[“”"']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Looks up an existing claim by normalized text without creating one.
export async function findClaimId(sql, rawClaim) {
  const normalizedClaim = normalizeClaim(rawClaim)
  const rows = await sql`select id from claims where normalized_claim = ${normalizedClaim} limit 1`
  return rows[0]?.id || null
}

// Looks up a claim, creating a zero-count placeholder row if it doesn't exist yet
// (e.g. someone votes/comments on a claim before it's ever gone through /api/search).
export async function findOrCreateClaimId(sql, rawClaim) {
  const normalizedClaim = normalizeClaim(rawClaim)
  const displayClaim = rawClaim.trim()
  const rows = await sql`
    insert into claims (normalized_claim, display_claim, search_count, first_searched_at, last_searched_at)
    values (${normalizedClaim}, ${displayClaim}, 0, now(), now())
    on conflict (normalized_claim) do update set updated_at = claims.updated_at
    returning id
  `
  return rows[0]?.id || null
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
