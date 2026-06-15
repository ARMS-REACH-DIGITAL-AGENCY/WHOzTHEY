import { neon } from '@neondatabase/serverless'

let sqlClient = null

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING
  )
}

function getSql() {
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

export async function GET() {
  try {
    const sql = getSql()

    const rows = await sql`
      select distinct on (normalized_claim)
        id,
        raw_claim,
        normalized_claim,
        verdict,
        created_at
      from searches
      where raw_claim is not null
        and trim(raw_claim) <> ''
      order by normalized_claim, created_at desc
      limit 12
    `

    const searches = rows
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8)

    return Response.json({ ok: true, searches })
  } catch (error) {
    console.error('Recent searches error:', error)
    return Response.json({ ok: false, searches: [] }, { status: 200 })
  }
}
