import { findSponsorByDashboardToken } from '../../../../lib/sponsorSignup'
import { getSql } from '../../../../lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const token = new URL(request.url).searchParams.get('token')
    if (!token) {
      return Response.json({ ok: false, error: 'Missing token.' }, { status: 400 })
    }

    const sponsor = await findSponsorByDashboardToken(token)
    if (!sponsor) {
      return Response.json({ ok: false, error: 'Sponsor not found.' }, { status: 404 })
    }

    const sql = getSql()

    const cards = await sql`
      select id, teaser, cta_label, cta_url, is_active, created_at
      from sponsor_cards
      where sponsor_id = ${sponsor.id}
      order by created_at asc
    `

    const cardIds = cards.map((card) => card.id)
    let impressions = 0
    let clicks = 0

    if (cardIds.length > 0) {
      const [impressionRow] = await sql`
        select count(*)::int as count from sponsor_impressions where sponsor_card_id = any(${cardIds})
      `
      const [clickRow] = await sql`
        select count(*)::int as count from sponsor_clicks where sponsor_card_id = any(${cardIds})
      `
      impressions = impressionRow?.count || 0
      clicks = clickRow?.count || 0
    }

    return Response.json({
      ok: true,
      sponsor: {
        sponsorName: sponsor.sponsor_name,
        tier: sponsor.tier,
        status: sponsor.status,
      },
      cards,
      stats: {
        impressions,
        clicks,
        clickThroughRate: impressions > 0 ? Math.round((clicks / impressions) * 1000) / 10 : 0,
      },
    })
  } catch (error) {
    console.error('Sponsor stats error:', error)
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }
}
