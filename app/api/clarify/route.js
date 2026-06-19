import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request) {
  try {
    const { claim } = await request.json()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: `You are the semantic clarification engine for WHOzTHEY? Find humor and ambiguity in folk claims.

Respond ONLY with valid JSON (no markdown):
{
  "needsClarification": true or false,
  "versions": [
    { "id": "a", "emoji": "emoji", "label": "Short title", "claim": "The intended interpretation as a They say statement", "tone": "serious" },
    { "id": "b", "emoji": "emoji", "label": "Short title", "claim": "The literal or funny alternative", "tone": "humorous" }
  ],
  "clarificationNote": "One witty sentence about why semantics matter here"
}

If the claim is already clear, set needsClarification to false and return empty versions array.
Always look for the funny literal interpretation — that's the brand.`,
      messages: [
        {
          role: 'user',
          content: `Analyze for semantic ambiguity: "${claim.trim()}"`,
        },
      ],
    })

    const raw = message.content[0].text
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
    return Response.json(parsed)
  } catch (error) {
    return Response.json({ needsClarification: false, versions: [] })
  }
}
