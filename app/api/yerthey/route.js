import Anthropic from '@anthropic-ai/sdk'

let anthropicClient = null

function getAnthropicClient() {
  if (!anthropicClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Missing ANTHROPIC_API_KEY')
    }

    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  return anthropicClient
}

function normalizeWebsiteUrl(website) {
  const value = `${website || ''}`.trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  return `https://${value}`
}

async function readWebsiteContext(website) {
  const url = normalizeWebsiteUrl(website)
  if (!url) return ''

  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'WHOzTHEY Sponsor Builder/1.0',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(5500),
    })

    if (!response.ok) return ''

    const html = await response.text()
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 4500)
  } catch (error) {
    console.warn('YerTHEY website read failed:', error)
    return ''
  }
}

const fallbackCampaign = {
  sponsorName: 'Your Sponsor',
  audienceSummary: 'Curious visitors who may care about this business, offer, product, cause, or idea.',
  recommendedHook: 'They have a story behind this offer.',
  hookOptions: [
    {
      hook: 'They have a story behind this offer.',
      whyItWorks: 'It creates curiosity without overpromising.',
      bestFor: 'General awareness and click-through campaigns.'
    }
  ],
  storyAngles: [
    {
      title: 'The human reason',
      story: 'Explain why the sponsor is making this offer, who it helps, and what makes the sponsor worth caring about.',
      emotionalTrigger: 'Trust and curiosity'
    }
  ],
  offerIdeas: [
    {
      offer: 'Invite visitors to take one simple next step.',
      whyItWorks: 'The offer is clear and low-friction.',
      suggestedCTA: 'Learn More'
    }
  ],
  landingPageSections: [
    {
      section: 'The Claim',
      copy: 'Repeat the They Hook that got the visitor to click.'
    },
    {
      section: 'The Story',
      copy: 'Reveal why the sponsor is doing this and why people should care.'
    },
    {
      section: 'The Offer',
      copy: 'Make the next action clear and measurable.'
    }
  ],
  packageRecommendations: [
    {
      packageName: 'Click-Through Hook',
      bestFor: 'Sponsors who only need traffic sent to an existing link.',
      why: 'Fastest path to launch.'
    }
  ],
  followUpIdeas: [
    'Thank the visitor for clicking from WHOzTHEY?.',
    'Restate the story and offer in plain language.',
    'Give one clear next step.'
  ],
  warnings: ['Avoid claims that are false, unverifiable, regulated, misleading, or guaranteed-income promises.']
}

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      website = '',
      business = '',
      goal = '',
      audience = '',
      story = '',
      offer = '',
    } = body || {}

    if (!website.trim() && !business.trim()) {
      return Response.json({ error: 'Add a website or business description first.' }, { status: 400 })
    }

    const websiteContext = await readWebsiteContext(website)
    const client = getAnthropicClient()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2600,
      system: `You are the sponsor-campaign strategist for WHOzTHEY?, a curiosity platform where visitors click claims that start with "They..." because they want to know WHOzTHEY? is.

Your job is NOT to create generic ads. Your job is to create a WHOzTHEY? sponsor campaign where the sponsor becomes the answer to a curiosity claim.

CORE FORMULA:
- YerHook gets attention. It MUST start with "They" and make a curious visitor want to ask WHOzTHEY?
- YerStory earns trust. It explains WHY the sponsor is doing this, why the visitor should care, and what human-interest angle makes the sponsor worth supporting.
- YerOffer creates action. It gives the visitor a clear next step: click, call, book, claim, visit, buy, join, donate, or submit a lead.

CRITICAL RULES:
- Give MULTIPLE suggestions for each stage, not just one.
- Be creative, but do not make false or unverifiable claims.
- Do not promise guaranteed income, guaranteed results, cures, legal outcomes, investment returns, or impossible claims.
- If the user's raw idea is weak, improve it and explain why.
- If a sponsor has no obvious offer, suggest practical offer types.
- The hook can be bold, but the landing page must pay it off honestly.
- Use clear marketing language a small business owner can understand.

Respond ONLY with valid JSON matching this shape:
{
  "sponsorName": "short name inferred from website/business",
  "audienceSummary": "who the campaign should attract",
  "recommendedHook": "best They... hook",
  "hookOptions": [
    {"hook":"They...", "whyItWorks":"why it earns the click", "bestFor":"when to use this hook"}
  ],
  "storyAngles": [
    {"title":"angle name", "story":"3-5 sentence story/reveal copy that answers WHOzTHEY? with the human why", "emotionalTrigger":"trust/urgency/community/identity/relief/etc."}
  ],
  "offerIdeas": [
    {"offer":"specific offer idea", "whyItWorks":"why it converts", "suggestedCTA":"button label"}
  ],
  "landingPageSections": [
    {"section":"section title", "copy":"draft copy for this section"}
  ],
  "packageRecommendations": [
    {"packageName":"Click-Through Hook | Story + Lead Capture | Full Funnel Campaign | Online Checkout | Website/Funnel Build", "bestFor":"who should buy this", "why":"why this package fits"}
  ],
  "followUpIdeas": ["follow-up text/email/CRM idea"],
  "warnings": ["compliance or claim-quality warning"]
}`,
      messages: [
        {
          role: 'user',
          content: `Build a WHOzTHEY? sponsor campaign from this intake.

Website URL: ${website || 'none'}
Website text/context found: ${websiteContext || 'No website text available.'}
Business or product description: ${business || 'not provided'}
Goal: ${goal || 'not provided'}
Audience/avatar: ${audience || 'not provided'}
Story/why: ${story || 'not provided'}
Possible offer or next step: ${offer || 'not provided'}`,
        },
      ],
    })

    const raw = message.content?.[0]?.text || ''
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())

    return Response.json(parsed)
  } catch (error) {
    console.error('YerTHEY generation error:', error)
    return Response.json({
      ...fallbackCampaign,
      error: 'AI generation failed, so this fallback structure was returned.',
    })
  }
}
