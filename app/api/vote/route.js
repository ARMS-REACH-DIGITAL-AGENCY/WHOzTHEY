import { getSql, findClaimId, findOrCreateClaimId } from '../../../lib/db'

let indexReady = null
async function ensureIndexes(sql) {
  if (indexReady) return indexReady
  indexReady = sql`create unique index if not exists votes_claim_layer_session_idx on votes (claim_id, vote_layer, session_id)`
  return indexReady
}

const LAYERS = ['claim', 'origin', 'who']
const CHOICES = ['sounds_good', 'call_bs', 'no_clue']

function emptyCounts() {
  return { sounds_good: 0, call_bs: 0, no_clue: 0, total: 0 }
}

async function getLayerCounts(sql, claimId, layer) {
  const rows = await sql`
    select vote_value, count(*)::int as n
    from votes
    where claim_id = ${claimId} and vote_layer = ${layer}
    group by vote_value
  `
  const counts = emptyCounts()
  for (const row of rows) {
    if (CHOICES.includes(row.vote_value)) counts[row.vote_value] = row.n
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

    const sql = getSql()
    const claimId = await findClaimId(sql, claim)

    if (!claimId) {
      return layer
        ? Response.json({ ok: true, layer, counts: emptyCounts() })
        : Response.json({ ok: true, stats: { claim: emptyCounts(), origin: emptyCounts(), who: emptyCounts() } })
    }

    if (layer) {
      const counts = await getLayerCounts(sql, claimId, layer)
      return Response.json({ ok: true, layer, counts })
    }

    const result = {}
    for (const l of LAYERS) {
      result[l] = await getLayerCounts(sql, claimId, l)
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

    const sql = getSql()
    await ensureIndexes(sql)
    const claimId = await findOrCreateClaimId(sql, claim)

    await sql`
      insert into votes (claim_id, vote_layer, vote_value, session_id, firebase_uid)
      values (${claimId}, ${layer}, ${choice}, ${sessionId || null}, ${firebaseUid || null})
      on conflict (claim_id, vote_layer, session_id)
      do update set vote_value = excluded.vote_value, created_at = now()
    `

    const counts = await getLayerCounts(sql, claimId, layer)
    return Response.json({ ok: true, layer, counts })
  } catch (error) {
    console.error('Vote POST error:', error)
    return Response.json({ ok: false, error: 'Failed to record vote' }, { status: 200 })
  }
}
