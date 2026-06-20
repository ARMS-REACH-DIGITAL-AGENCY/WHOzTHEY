import { neon } from '@neondatabase/serverless'
import { ensureSponsorTables } from '../../../lib/sponsorSchema'

export const dynamic = 'force-dynamic'

let sqlClient = null

const DEFAULT_SPONSOR_CARDS = [
  {
    sponsorName: 'Travel Protection Club by Benefit Buddies',
    contactName: 'Pete DeLuca',
    websiteUrl: 'https://tpc-eight.vercel.app/',
    ctaUrl: 'https://tpc-eight.vercel.app/',
    teaser: 'They are giving golfers $75 ShipSticks Vouchers!',
    body: 'Travel Protection Club by Benefit Buddies helps golfers protect trips, shipments, and travel plans with real savings and added peace of mind.',
    ctaLabel: 'Claim Your Voucher →',
    accentColor: '#0284c7',
    linkMode: 'frame',
  },
  {
    sponsorName: 'YatStats',
    websiteUrl: 'https://yatstats.com',
    ctaUrl: 'https://yatstats.com',
    teaser: 'They are helping high school baseball teams raise money!',
    body: 'YAT?STATS turns alumni tracking, nostalgia, and local sports pride into a fundraising and fan-engagement platform for schools and booster programs.',
    ctaLabel: 'See Where They YAT? →',
    accentColor: '#16a34a',
  },
  {
    sponsorName: 'H2Yo!',
    websiteUrl: 'https://arms-reach-digital-agency.github.io/h2yo/#lead-capture',
    ctaUrl: 'https://arms-reach-digital-agency.github.io/h2yo/#lead-capture',
    teaser: 'They have premium branded water that works as hard as you do!',
    body: 'H2Yo! puts your brand in people’s hands with premium hydration built for events, teams, businesses, and community campaigns.',
    ctaLabel: 'Get H2Yo! →',
    accentColor: '#7c3aed',
  },
  {
    sponsorName: 'ARMS Reach Digital Agency',
    websiteUrl: 'https://whozthey.com',
    ctaUrl: 'https://whozthey.com',
    teaser: 'They are helping businesses acquire new qualified clients!',
    body: 'ARMS Reach Digital Agency builds AI-powered funnels, automation, CRM systems, and lead-generation campaigns that keep businesses within arm’s reach of their best prospects.',
    ctaLabel: 'Meet ARMS Reach →',
    accentColor: '#dc2626',
  },
  {
    sponsorName: 'ASB · PeteIsMyAgent.com',
    websiteUrl: 'https://peteismyagent.com',
    ctaUrl: 'https://peteismyagent.com',
    teaser: 'They have an amazing selection of custom apparel!',
    body: 'ASB gives businesses, teams, schools, and events access to a massive branded merchandise catalog with personal service from a national promotional-products source.',
    ctaLabel: 'Shop Promo Products →',
    accentColor: '#d97706',
  },
]

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING
  )
}

function getSql() {
  if (!sqlClient) {
    const databaseUrl = getDatabaseUrl()
    if (!databaseUrl) {
      throw new Error('Missing database URL. Expected DATABASE_URL, POSTGRES_URL, POSTGRES_PRISMA_URL, or POSTGRES_URL_NON_POOLING.')
    }
    sqlClient = neon(databaseUrl)
  }
  return sqlClient
}

async function seedDefaultSponsors(sql) {
  for (const card of DEFAULT_SPONSOR_CARDS) {
    let existingSponsor = (await sql`
      select id from sponsors where sponsor_name = ${card.sponsorName} order by created_at asc limit 1
    `)[0]

    if (!existingSponsor?.id) {
      existingSponsor = (await sql`
        insert into sponsors (sponsor_name, contact_name, website_url, cta_url, status)
        values (${card.sponsorName}, ${card.contactName || null}, ${card.websiteUrl || null}, ${card.ctaUrl || null}, 'active')
        returning id
      `)[0]
    }

    if (!existingSponsor?.id) continue

    await sql`
      update sponsors
      set
        contact_name = coalesce(contact_name, ${card.contactName || null}),
        website_url = ${card.websiteUrl || null},
        cta_url = ${card.ctaUrl || null},
        status = 'active',
        updated_at = now()
      where sponsor_name = ${card.sponsorName}
    `

    const existingCards = await sql`
      select id from sponsor_cards
      where sponsor_id in (select id from sponsors where sponsor_name = ${card.sponsorName})
      order by created_at asc
    `

    if (existingCards.length === 0) {
      await sql`
        insert into sponsor_cards (sponsor_id, teaser, body, cta_label, cta_url, accent_color, link_mode, is_active)
        values (${existingSponsor.id}, ${card.teaser}, ${card.body}, ${card.ctaLabel}, ${card.ctaUrl}, ${card.accentColor}, ${card.linkMode || 'panel'}, true)
      `
    } else {
      await sql`
        update sponsor_cards
        set
          teaser = ${card.teaser},
          body = ${card.body},
          cta_label = ${card.ctaLabel},
          cta_url = ${card.ctaUrl},
          accent_color = ${card.accentColor},
          link_mode = ${card.linkMode || 'panel'},
          is_active = true,
          updated_at = now()
        where sponsor_id in (select id from sponsors where sponsor_name = ${card.sponsorName})
      `
    }
  }
}

function mapSponsorCard(row) {
  return {
    id: row.id,
    isSponsor: true,
    sponsor: row.sponsor_name,
    badge: 'SPONSORED',
    badgeColor: row.accent_color || '#dc2626',
    teaser: row.teaser,
    body: row.body || '',
    cta: row.cta_label || 'Learn More →',
    ctaUrl: row.cta_url || row.sponsor_cta_url || row.website_url || 'https://whozthey.com',
    accent: row.accent_color || '#dc2626',
    linkMode: row.link_mode || 'panel',
    logoUrl: row.logo_url || null,
    leadFields: row.lead_fields || null,
  }
}

export async function GET() {
  try {
    const sql = getSql()
    await ensureSponsorTables(sql)
    await seedDefaultSponsors(sql)

    const rows = await sql`
      select
        sc.id,
        sc.teaser,
        sc.body,
        sc.cta_label,
        sc.cta_url,
        sc.accent_color,
        sc.link_mode,
        sc.logo_url,
        sc.lead_fields,
        s.sponsor_name,
        s.website_url,
        s.cta_url as sponsor_cta_url
      from sponsor_cards sc
      join sponsors s on s.id = sc.sponsor_id
      where sc.is_active = true
        and (sc.starts_at is null or sc.starts_at <= now())
        and (sc.ends_at is null or sc.ends_at >= now())
      order by sc.created_at asc
    `

    return Response.json({ ok: true, sponsorCards: rows.map(mapSponsorCard) })
  } catch (error) {
    console.error('Sponsor cards error:', error)
    return Response.json({ ok: false, sponsorCards: [] }, { status: 200 })
  }
}
