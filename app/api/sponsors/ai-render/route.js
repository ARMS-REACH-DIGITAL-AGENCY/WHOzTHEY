import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MEDIA_TYPE_BY_EXT = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}

async function fetchImageAsBase64(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Could not fetch the uploaded image.')
  const contentType = res.headers.get('content-type') || ''
  const ext = url.split('.').pop()?.toLowerCase()
  const mediaType = contentType.startsWith('image/') ? contentType : MEDIA_TYPE_BY_EXT[ext] || 'image/png'
  const buffer = Buffer.from(await res.arrayBuffer())
  return { mediaType, base64: buffer.toString('base64') }
}

export async function POST(request) {
  try {
    const { logoUrl, sponsorName, notes } = await request.json()
    if (!logoUrl) {
      return Response.json({ ok: false, error: 'logoUrl is required.' }, { status: 400 })
    }

    const { mediaType, base64 } = await fetchImageAsBase64(logoUrl)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: `You help small businesses turn a logo or marketing mockup into a WHOzTHEY? sponsor "hook" — a
curiosity-driven teaser that reads like a "They say..." claim, plus a short reveal pitch.

Respond ONLY with valid JSON (no markdown):
{
  "accentColor": "#hex color sampled or inferred from the brand's dominant color",
  "claimText": "A short curiosity hook starting with 'They' (e.g. 'They are giving away free pizza in Chandler, AZ!')",
  "revealBody": "A 1-2 sentence pitch for the reveal panel, written in the brand's voice if discernible",
  "ctaLabel": "A punchy 2-4 word call to action button label"
}`,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            {
              type: 'text',
              text: `Brand/company name: ${sponsorName || 'Unknown'}. Extra notes from the sponsor: ${notes || 'none'}. Analyze this logo/mockup and produce the JSON described.`,
            },
          ],
        },
      ],
    })

    const raw = message.content[0].text
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
    return Response.json({ ok: true, suggestions: parsed })
  } catch (error) {
    console.error('Sponsor AI render error:', error)
    return Response.json({ ok: false, error: 'AI could not analyze that image. Try filling in the form manually.' }, { status: 500 })
  }
}
