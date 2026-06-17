import { getSql, findClaimId, findOrCreateClaimId } from '../../../lib/db'

function mapComment(row) {
  return {
    id: row.id,
    parentCommentId: row.parent_comment_id,
    name: row.display_name || 'Anonymous',
    text: row.body,
    createdAt: row.created_at,
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const claim = searchParams.get('claim')
    if (!claim) {
      return Response.json({ error: 'Missing claim' }, { status: 400 })
    }

    const sql = getSql()
    const claimId = await findClaimId(sql, claim)
    if (!claimId) {
      return Response.json({ ok: true, comments: [] })
    }

    const rows = await sql`
      select id, parent_comment_id, display_name, body, created_at
      from comments
      where claim_id = ${claimId} and is_deleted = false
      order by created_at asc
    `
    return Response.json({ ok: true, comments: rows.map(mapComment) })
  } catch (error) {
    console.error('Comments GET error:', error)
    return Response.json({ ok: false, comments: [] }, { status: 200 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { claim, sessionId, firebaseUid, displayName, text, parentCommentId } = body

    if (!claim || !text || !text.trim()) {
      return Response.json({ error: 'Missing claim or text' }, { status: 400 })
    }

    const sql = getSql()
    const claimId = await findOrCreateClaimId(sql, claim)

    const rows = await sql`
      insert into comments (claim_id, parent_comment_id, session_id, firebase_uid, display_name, body)
      values (${claimId}, ${parentCommentId || null}, ${sessionId || null}, ${firebaseUid || null}, ${displayName || 'Anonymous'}, ${text.trim()})
      returning id, parent_comment_id, display_name, body, created_at
    `

    return Response.json({ ok: true, comment: mapComment(rows[0]) })
  } catch (error) {
    console.error('Comments POST error:', error)
    return Response.json({ ok: false, error: 'Failed to post comment' }, { status: 500 })
  }
}
