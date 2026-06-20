import { getSql } from '../../../../lib/db'
import { ensureSponsorTables } from '../../../../lib/sponsorSchema'
import { findSponsorByDashboardToken } from '../../../../lib/sponsorSignup'
import { getSponsorTier } from '../../../../lib/sponsorTiers'

export const dynamic = 'force-dynamic'

function buildLeadFields(rawLeadFields) {
  if (!rawLeadFields) return null
  const fields = Array.isArray(rawLeadFields.fields)
    ? rawLeadFields.fields.filter((f) => ['name', 'email', 'phone'].includes(f))
    : []
  if (!fields.length) return null
  return { fields, question: (rawLeadFields.question || '').trim() || null }
}

// Lets an already-paying sponsor add another hook/campaign pointed at the same
// or a different offer, from their dashboard — no second checkout required.
export async function POST(request) {
  try {
    const { token, claimText, revealBody, ctaLabel, ctaUrl, logoUrl, accentColor, leadFields } = await request.json()

    const sponsor = await findSponsorByDashboardToken(token)
    if (!sponsor) {
      return Response.json({ ok: false, error: 'Sponsor not found.' }, { status: 404 })
    }
    if (sponsor.status !== 'active') {
      return Response.json({ ok: false, error: 'Your subscription must be active to add another hook.' }, { status: 403 })
    }
    if (!claimText) {
      return Response.json({ ok: false, error: 'claimText is required.' }, { status: 400 })
    }

    const tier = getSponsorTier(sponsor.tier)
    const sql = getSql()
    await ensureSponsorTables(sql)
    const normalizedLeadFields = tier?.leadCapture ? buildLeadFields(leadFields) : null

    const [card] = await sql`
      insert into sponsor_cards (
        sponsor_id, teaser, body, cta_label, cta_url, logo_url, accent_color, link_mode, lead_fields, is_active, starts_at
      )
      values (
        ${sponsor.id}, ${claimText}, ${revealBody || null}, ${ctaLabel || 'Learn More →'}, ${ctaUrl || null},
        ${logoUrl || null}, ${accentColor || '#dc2626'}, ${tier?.defaultLinkMode || 'panel'},
        ${normalizedLeadFields ? JSON.stringify(normalizedLeadFields) : null}::jsonb, true, now()
      )
      returning id
    `

    return Response.json({ ok: true, cardId: card.id })
  } catch (error) {
    console.error('Add sponsor card error:', error)
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }
}
