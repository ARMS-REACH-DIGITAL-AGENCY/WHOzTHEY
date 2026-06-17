import { getSql } from '../../../lib/db'

let indexReady = null
async function ensureIndexes(sql) {
  if (indexReady) return indexReady
  indexReady = sql`create unique index if not exists visitors_session_id_idx on visitors (session_id)`
  return indexReady
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { sessionId, firebaseUid, email, displayName, persona, source } = body

    if (!sessionId) {
      return Response.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const sql = getSql()
    await ensureIndexes(sql)

    await sql`
      insert into visitors (session_id, firebase_uid, email, display_name, persona, source)
      values (${sessionId}, ${firebaseUid || null}, ${email || null}, ${displayName || null}, ${persona || null}, ${source || 'web'})
      on conflict (session_id) do update set
        firebase_uid = coalesce(excluded.firebase_uid, visitors.firebase_uid),
        email = coalesce(excluded.email, visitors.email),
        display_name = coalesce(excluded.display_name, visitors.display_name),
        persona = coalesce(excluded.persona, visitors.persona),
        updated_at = now()
    `

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Visitor POST error:', error)
    return Response.json({ ok: false }, { status: 200 })
  }
}
