import { getSql, UUID_RE } from '../../../lib/db'
import { ensureSponsorTables } from '../../../lib/sponsorSchema'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { sponsorCardId, sessionId, firebaseUid, name, email, phone, answer } = await request.json()

    if (!UUID_RE.test(sponsorCardId || '')) {
      return Response.json({ ok: false, error: 'Invalid sponsorCardId.' }, { status: 400 })
    }

    const sql = getSql()
    await ensureSponsorTables(sql)

    const [card] = await sql`
      select sc.id, sc.sponsor_id, s.sponsor_name, s.contact_email, s.ghl_contact_id
      from sponsor_cards sc
      join sponsors s on s.id = sc.sponsor_id
      where sc.id = ${sponsorCardId}
      limit 1
    `
    if (!card) {
      return Response.json({ ok: false, error: 'Sponsor card not found.' }, { status: 404 })
    }

    await sql`
      insert into sponsor_leads (sponsor_card_id, sponsor_id, name, email, phone, answer, session_id, firebase_uid)
      values (${sponsorCardId}, ${card.sponsor_id}, ${name || null}, ${email || null}, ${phone || null}, ${answer || null}, ${sessionId || null}, ${firebaseUid || null})
    `

    // Optional: forward to GoHighLevel (ARMS) once the sponsor has a connected sub-account/webhook.
    if (process.env.GHL_WEBHOOK_URL) {
      fetch(process.env.GHL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'WHOzTHEY-sponsor-lead',
          sponsorName: card.sponsor_name,
          sponsorCardId,
          name: name || null,
          email: email || null,
          phone: phone || null,
          answer: answer || null,
        }),
      }).catch(() => {})
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Sponsor lead error:', error)
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }
}
