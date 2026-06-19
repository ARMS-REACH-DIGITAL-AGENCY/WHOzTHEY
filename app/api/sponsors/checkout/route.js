import { getSql } from '../../../../lib/db'
import { getStripe } from '../../../../lib/stripeClient'
import { getSponsorTier } from '../../../../lib/sponsorTiers'
import { ensureSponsorSignupSchema, generateDashboardToken } from '../../../../lib/sponsorSignup'

export const dynamic = 'force-dynamic'

async function ensureSponsorTables(sql) {
  await sql`create extension if not exists pgcrypto`

  await sql`
    create table if not exists sponsors (
      id uuid primary key default gen_random_uuid(),
      sponsor_name text not null,
      contact_name text,
      contact_email text,
      website_url text,
      cta_url text,
      status text not null default 'draft',
      stripe_customer_id text,
      stripe_subscription_id text,
      ghl_contact_id text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `

  await sql`
    create table if not exists sponsor_cards (
      id uuid primary key default gen_random_uuid(),
      sponsor_id uuid references sponsors(id) on delete cascade,
      teaser text not null,
      body text,
      cta_label text,
      cta_url text,
      accent_color text,
      link_mode text not null default 'panel',
      is_active boolean not null default false,
      starts_at timestamptz,
      ends_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { tierKey, sponsorName, contactName, contactEmail, claimText, ctaUrl, logoUrl, accentColor } = body

    const tier = getSponsorTier(tierKey)
    if (!tier) {
      return Response.json({ ok: false, error: 'Unknown sponsorship tier.' }, { status: 400 })
    }
    if (!sponsorName || !contactEmail || !claimText || !ctaUrl) {
      return Response.json(
        { ok: false, error: 'sponsorName, contactEmail, claimText, and ctaUrl are required.' },
        { status: 400 }
      )
    }

    const sql = getSql()
    await ensureSponsorTables(sql)
    await ensureSponsorSignupSchema(sql)

    const dashboardToken = generateDashboardToken()

    const [sponsor] = await sql`
      insert into sponsors (sponsor_name, contact_name, contact_email, website_url, cta_url, status, tier, dashboard_token)
      values (${sponsorName}, ${contactName || null}, ${contactEmail}, ${ctaUrl}, ${ctaUrl}, 'pending_payment', ${tier.key}, ${dashboardToken})
      returning id
    `

    const [card] = await sql`
      insert into sponsor_cards (sponsor_id, teaser, body, cta_label, cta_url, accent_color, link_mode, is_active)
      values (${sponsor.id}, ${claimText}, ${logoUrl ? `Logo: ${logoUrl}` : null}, 'Learn More →', ${ctaUrl}, ${accentColor || '#dc2626'}, ${tier.defaultLinkMode}, false)
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
