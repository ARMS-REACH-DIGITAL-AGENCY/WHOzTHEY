import { getSql } from '../../../../lib/db'
import { getStripe } from '../../../../lib/stripeClient'
import { getSponsorTier } from '../../../../lib/sponsorTiers'
import { ensureSponsorTables } from '../../../../lib/sponsorSchema'
import { generateDashboardToken } from '../../../../lib/sponsorSignup'

export const dynamic = 'force-dynamic'

function buildLeadFields(rawLeadFields) {
  if (!rawLeadFields) return null
  const fields = Array.isArray(rawLeadFields.fields)
    ? rawLeadFields.fields.filter((f) => ['name', 'email', 'phone'].includes(f))
    : []
  if (!fields.length) return null
  return { fields, question: (rawLeadFields.question || '').trim() || null }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      tierKey,
      sponsorName,
      contactName,
      contactEmail,
      claimText,
      revealBody,
      ctaLabel,
      ctaUrl,
      logoUrl,
      accentColor,
      leadFields,
    } = body

    const tier = getSponsorTier(tierKey)
    if (!tier) {
      return Response.json({ ok: false, error: 'Unknown sponsorship tier.' }, { status: 400 })
    }
    if (!sponsorName || !contactEmail || !claimText) {
      return Response.json(
        { ok: false, error: 'sponsorName, contactEmail, and claimText are required.' },
        { status: 400 }
      )
    }
    if (tier.key !== 'leads' && !ctaUrl) {
      return Response.json({ ok: false, error: 'ctaUrl is required for this tier.' }, { status: 400 })
    }

    const sql = getSql()
    await ensureSponsorTables(sql)

    const dashboardToken = generateDashboardToken()
    const normalizedLeadFields = tier.leadCapture ? buildLeadFields(leadFields) : null

    const [sponsor] = await sql`
      insert into sponsors (sponsor_name, contact_name, contact_email, website_url, cta_url, status, tier, dashboard_token)
      values (${sponsorName}, ${contactName || null}, ${contactEmail}, ${ctaUrl || null}, ${ctaUrl || null}, 'pending_payment', ${tier.key}, ${dashboardToken})
      returning id
    `

    const [card] = await sql`
      insert into sponsor_cards (
        sponsor_id, teaser, body, cta_label, cta_url, logo_url, accent_color, link_mode, lead_fields, is_active
      )
      values (
        ${sponsor.id}, ${claimText}, ${revealBody || null}, ${ctaLabel || 'Learn More →'}, ${ctaUrl || null},
        ${logoUrl || null}, ${accentColor || '#dc2626'}, ${tier.defaultLinkMode},
        ${normalizedLeadFields ? JSON.stringify(normalizedLeadFields) : null}::jsonb, false
      )
      returning id
    `

    const origin = request.headers.get('origin') || 'https://www.whozthey.com'
    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: tier.priceId, quantity: 1 }],
      customer_email: contactEmail,
      success_url: `${origin}/sponsors/thank-you?token=${dashboardToken}`,
      cancel_url: `${origin}/sponsors?canceled=1`,
      metadata: {
        sponsorId: sponsor.id,
        sponsorCardId: card.id,
        tier: tier.key,
      },
    })

    return Response.json({ ok: true, checkoutUrl: session.url })
  } catch (error) {
    console.error('Sponsor checkout error:', error)
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }
}
