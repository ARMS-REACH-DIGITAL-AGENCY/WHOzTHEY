import { getSql } from '../../../lib/db'

let indexReady = null
async function ensureIndexes(sql) {
  if (indexReady) return indexReady
  indexReady = sql`create unique index if not exists user_badges_badge_session_idx on user_badges (badge_id, session_id)`
  return indexReady
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const firebaseUid = searchParams.get('firebaseUid')

    if (!sessionId && !firebaseUid) {
      return Response.json({ ok: true, badgeIds: [] })
    }

    const sql = getSql()
    const rows = firebaseUid
      ? await sql`select distinct badge_id from user_badges where session_id = ${sessionId} or firebase_uid = ${firebaseUid}`
      : await sql`select distinct badge_id from user_badges where session_id = ${sessionId}`

    return Response.json({ ok: true, badgeIds: rows.map((r) => r.badge_id) })
  } catch (error) {
    console.error('Badges GET error:', error)
    return Response.json({ ok: false, badgeIds: [] }, { status: 200 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { badgeId, sessionId, firebaseUid } = body

    if (!badgeId) {
      return Response.json({ error: 'Missing badgeId' }, { status: 400 })
    }

    const sql = getSql()
    await ensureIndexes(sql)

    const inserted = await sql`
      insert into user_badges (badge_id, session_id, firebase_uid)
      values (${badgeId}, ${sessionId || null}, ${firebaseUid || null})
      on conflict (badge_id, session_id) do nothing
      returning id
    `

    if (inserted.length > 0) {
      const badgeRows = await sql`select points from badges where id = ${badgeId} limit 1`
      const points = badgeRows[0]?.points || 0
      if (points > 0) {
        await sql`
          insert into points_events (session_id, firebase_uid, event_type, points, metadata)
          values (${sessionId || null}, ${firebaseUid || null}, 'badge_earned', ${points}, ${JSON.stringify({ badgeId })}::jsonb)
        `
      }
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Badges POST error:', error)
    return Response.json({ ok: false }, { status: 200 })
  }
}
