import { getSql, UUID_RE } from '../../../lib/db'

export async function POST(request) {
  try {
    const body = await request.json()
    const { type, sponsorCardId, sessionId, firebaseUid, placement, destinationUrl } = body

    // Only DB-backed sponsor cards have real uuid ids; the hardcoded fallback
    // ads (used when /api/sponsor-cards is unreachable) use plain ids like "s1"
    // and have nothing to join against, so skip those silently.
    if (!UUID_RE.test(sponsorCardId || '')) {
      return Response.json({ ok: true, skipped: true })
    }

    const sql = getSql()

    if (type === 'click') {
      await sql`
        insert into sponsor_clicks (sponsor_card_id, session_id, firebase_uid, placement, destination_url)
        values (${sponsorCardId}, ${sessionId || null}, ${firebaseUid || null}, ${placement || 'footer_carousel'}, ${destinationUrl || null})
      `
    } else {
      await sql`
        insert into sponsor_impressions (sponsor_card_id, session_id, firebase_uid, placement)
        values (${sponsorCardId}, ${sessionId || null}, ${firebaseUid || null}, ${placement || 'footer_carousel'})
      `
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Sponsor track error:', error)
    return Response.json({ ok: false }, { status: 200 })
  }
}
