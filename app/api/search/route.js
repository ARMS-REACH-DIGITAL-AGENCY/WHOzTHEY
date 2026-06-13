import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request) {
  try {
    const { claim } = await request.json()

    if (!claim || claim.trim().length === 0) {
      return Response.json({ error: 'No claim provided' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are the research engine for WHOzTHEY? — a website investigating the true origins of folk sayings and "They say..." claims. Respond ONLY with valid JSON (no markdown, no backticks):
{
  "verdict": "TRUE|FALSE|PARTIALLY TRUE|MYTH|DISPUTED",
  "whoIsThey": "2-3 sentences — WHO specifically are 'they'? Name real people, institutions, cultures, eras.",
  "origin": "2-3 sentences on where/when this originated. Name real figures or publications.",
  "research": "2-3 sentences — what does modern science/scholarship say?",
  "culturalSpread": "2-3 sentences on how this spread and why it persisted.",
  "funFact": "One surprising sentence.",
  "sources": ["source1", "source2", "source3"]
}`,
      messages: [
        {
          role: 'user',
          content: `Research this claim: "${claim.trim()}"`,
        },
      ],
    })

    const raw = message.content[0].text
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())

    // Optional: Post to GoHighLevel webhook if configured
    if (process.env.GHL_WEBHOOK_URL) {
      fetch(process.env.GHL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim, verdict: parsed.verdict, source: 'WHOzTHEY' }),
      }).catch(() => {}) // fire and forget
    }

    return Response.json(parsed)
  } catch (error) {
    console.error('Search error:', error)
    return Response.json({ error: 'Failed to research claim' }, { status: 500 })
  }
}
