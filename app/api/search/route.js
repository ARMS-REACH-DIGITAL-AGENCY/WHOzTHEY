import Anthropic from '@anthropic-ai/sdk'
import { neon } from '@neondatabase/serverless'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

let sqlClient = null

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
      throw new Error(
        'Missing database URL. Expected DATABASE_URL, POSTGRES_URL, POSTGRES_PRISMA_URL, or POSTGRES_URL_NON_POOLING.'
      )
    }

    sqlClient = neon(databaseUrl)
  }

  return sqlClient
}

function normalizeClaim(claim) {
  return claim
    .toLowerCase()
    .trim()
    .replace(/^they say\s+/i, '')
    .replace(/[“”"']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getClientIpHashSource(request) {
  // Do not store raw IPs here. This returns only a short source string that can
  // later be replaced with a real one-way hash if needed.
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ipSource = forwardedFor || realIp || ''

  if (!ipSource) return null

  // Simple non-sensitive fingerprint placeholder; not a real hash.
  return `ip_seen_${ipSource.split(',')[0].trim().length}`
}

async function logSearchToNeon({ request, claim, parsed, sessionId, firebaseUid }) {
  const sql = getSql()
  const normalizedClaim = normalizeClaim(claim)
  const displayClaim = claim.trim()
  const userAgent = request.headers.get('user-agent') || null
  const ipHash = getClientIpHashSource(request)

  const claimRows = await sql`
    insert into claims (
      normalized_claim,
      display_claim,
      search_count,
      first_searched_at,
      last_searched_at
    )
    values (
      ${normalizedClaim},
      ${displayClaim},
      1,
      now(),
      now()
    )
    on conflict (normalized_claim)
    do update set
      search_count = claims.search_count + 1,
      last_searched_at = now(),
      updated_at = now()
    returning id
  `

  const claimId = claimRows[0]?.id

  if (!claimId) {
    throw new Error('Unable to create or find claim record.')
  }

  const searchRows = await sql`
    insert into searches (
      claim_id,
      session_id,
      firebase_uid,
      raw_claim,
      normalized_claim,
      verdict,
      who_is_they,
      origin,
      source,
      user_agent,
      ip_hash
    )
    values (
      ${claimId},
      ${sessionId || null},
      ${firebaseUid || null},
      ${displayClaim},
      ${normalizedClaim},
      ${parsed?.verdict || null},
      ${parsed?.whoIsThey || null},
      ${parsed?.origin || null},
      'search',
      ${userAgent},
      ${ipHash}
    )
    returning id
  `

  return {
    claimId,
    searchId: searchRows[0]?.id || null,
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { claim, sessionId, firebaseUid } = body

    if (!claim || claim.trim().length === 0) {
      return Response.json({ error: 'No claim provided' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      system: `You are the research engine for WHOzTHEY? — a lighthearted, balanced, and intellectually honest website that investigates the true origins of folk sayings, old wives' tales, and "They say..." claims.

Your tone is Walter Cronkite: calm, fair, authoritative, and non-partisan. You present both sides of every claim without judgment. You do not tell visitors what to think — you give them the information they need to decide for themselves.

IMPORTANT PRINCIPLES:
- Traditional wisdom, generational knowledge, and faith-based perspectives are given equal standing alongside modern scientific or institutional views
- Do not default to mainstream media, government agencies, or academic institutions as the automatic final authority
- When "they" is an institution, government body, or media outlet, identify that clearly and honestly
- Acknowledge when a claim is genuinely contested rather than forcing a verdict
- Keep it light, curious, and fun — this is not a political fact-checking site
- Respect the visitor's intelligence and their right to draw their own conclusions
- When relevant, acknowledge that the same claim looks different depending on your perspective — like two people describing opposite sides of an open hand

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "verdict": one of "ORIGIN TRACED" | "BOTH SIDES VALID" | "TRADITIONAL WISDOM" | "INSTITUTIONALLY PUSHED" | "GENUINELY DISPUTED" | "LIGHTHEARTED MYTH",
  "verdictNote": "One short sentence explaining the verdict in plain, friendly language",
  "whoIsThey": "2-3 sentences — WHO specifically are 'they'? Name the real people, culture, era, or institution that originated this claim. Be specific and interesting.",
  "origin": "2-3 sentences on where and when this originated. Name real historical figures, publications, or moments when possible.",
  "traditionalView": "2-3 sentences presenting the traditional, folk, faith-based, or common-sense perspective on this claim. Treat this view with full respect.",
  "modernView": "2-3 sentences presenting the modern scientific, institutional, or contemporary perspective. Present fairly without bias.",
  "commonGround": "1-2 sentences identifying what both perspectives actually agree on, if anything. Leave null if there is genuinely no common ground.",
  "culturalSpread": "2 sentences on how this saying spread through families, communities, and culture — and why people kept repeating it.",
  "funFact": "One surprising, lighthearted sentence that makes the visitor smile or say wow.",
  "sources": ["2-3 specific, plausible source strings — mix traditional and modern sources"]
}`,
      messages: [
        {
          role: 'user',
          content: `Research this claim for WHOzTHEY?: "${claim.trim()}"`,
        },
      ],
    })

    const raw = message.content[0].text
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())

    let tracking = null

    try {
      tracking = await logSearchToNeon({
        request,
        claim,
        parsed,
        sessionId,
        firebaseUid,
      })
    } catch (dbError) {
      // Do not break the user search experience if tracking fails.
      // Check Vercel function logs if this warning appears.
      console.warn('Search completed but Neon logging failed:', dbError)
    }

    // Optional: Post to GoHighLevel webhook
    if (process.env.GHL_WEBHOOK_URL) {
      fetch(process.env.GHL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim,
          verdict: parsed.verdict,
          source: 'WHOzTHEY',
          sessionId: sessionId || null,
          firebaseUid: firebaseUid || null,
          claimId: tracking?.claimId || null,
          searchId: tracking?.searchId || null,
        }),
      }).catch(() => {})
    }

    return Response.json({
      ...parsed,
      tracking,
    })
  } catch (error) {
    console.error('Search error:', error)
    return Response.json({ error: 'Failed to research claim' }, { status: 500 })
  }
}
