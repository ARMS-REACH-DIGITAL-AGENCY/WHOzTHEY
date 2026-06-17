import { neon } from '@neondatabase/serverless'

let sqlClient = null
let tableReady = null

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

async function ensureTable() {
  if (tableReady) return tableReady
  const sql = getSql()
  tableReady = sql`
    create table if not exists votes (
      id serial primary key,
      normalized_claim text not null,
      layer text not null,
      choice text not null,
      session_id text,
      firebase_uid text,
      created_at timestamptz not null default now(),
      unique (normalized_claim, layer, session_id)
    )
  `
  return tableReady
}

function normalizeClaim(claim) {
  return claim
    .toLowerCase()
    .trim()
    .replace(/^they say\s+/i, '')
    .replace(/[“”"']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const LAYERS = ['claim', 'origin', 'who']
const CHOICES = ['sounds_good', 'call_bs', 'no_clue']

function emptyCounts() {
  return { sounds_good: 0, call_bs: 0, no_clue: 0, total: 0 }
}

async function getLayerCounts(sql, normalizedClaim, layer) {
  const rows = await sql`
    select choice, count(*)::int as n
    from votes
    where normalized_claim = ${normalizedClaim} and layer = ${layer}
    group by choice
  `
  const counts = emptyCounts()
  for (const row of rows) {
    if (CHOICES.includes(row.choice)) counts[row.choice] = row.n
  }
  counts.total = counts.sounds_good + counts.call_bs + counts.no_clue
  return counts
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const claim = searchParams.get('claim')
    const layer = searchParams.get('layer')

    if (!claim) {
      return Response.json({ error: 'Missing claim' }, { status: 400 })
    }

    await ensureTable()
    const sql = getSql()
    const normalizedClaim = normalizeClaim(claim)

    if (layer) {
      const counts = await getLayerCounts(sql, normalizedClaim, layer)
      return Response.json({ ok: true, layer, counts })
    }

    const result = {}
    for (const l of LAYERS) {
      result[l] = await getLayerCounts(sql, normalizedClaim, l)
    }
    return Response.json({ ok: true, stats: result })
  } catch (error) {
    console.error('Vote GET error:', error)
    return Response.json({ ok: false, stats: null }, { status: 200 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { claim, layer, choice, sessionId, firebaseUid } = body

    if (!claim || !LAYERS.includes(layer) || !CHOICES.includes(choice)) {
      return Response.json({ error: 'Invalid vote payload' }, { status: 400 })
    }

    await ensureTable()
    const sql = getSql()
    const normalizedClaim = normalizeClaim(claim)

    await sql`
      insert into votes (normalized_claim, layer, choice, session_id, firebase_uid)
      values (${normalizedClaim}, ${layer}, ${choice}, ${sessionId || null}, ${firebaseUid || null})
      on conflict (normalized_claim, layer, session_id)
      do update set choice = excluded.choice, created_at = now()
    `

    const counts = await getLayerCounts(sql, normalizedClaim, layer)
    return Response.json({ ok: true, layer, counts })
  } catch (error) {
    console.error('Vote POST error:', error)
    return Response.json({ ok: false, error: 'Failed to record vote' }, { status: 200 })
  }
}
