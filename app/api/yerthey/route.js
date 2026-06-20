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

function normalizeWebsiteUrl(website, protocol = 'https') {
  const value = `${website || ''}`.trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  return `${protocol}://${value}`
}

function inferSponsorName(website, business = '') {
  const rawHost = `${website || ''}`
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]

  if (rawHost) {
    const root = rawHost.split('.')[0]
    return root
      .split(/[-_]/g)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }

  const words = `${business || ''}`.trim().split(/\s+/).filter(Boolean)
  return words.length ? words.slice(0, 3).join(' ') : 'Your Sponsor'
}

function safeText(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function extractJson(raw) {
  const text = `${raw || ''}`.trim()
  if (!text) throw new Error('AI returned empty response')

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced ? fenced[1].trim() : text
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('AI response did not contain a JSON object')
  }

  return JSON.parse(candidate.slice(start, end + 1))
}

async function fetchWebsiteText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; WHOzTHEY-SponsorBuilder/1.0; +https://whozthey.com)',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  })

  if (!response.ok) {
    throw new Error(`Website returned ${response.status}`)
  }

  const html = await response.text()
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ''
  const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i)?.[1] ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["'][^>]*>/i)?.[1] || ''

  const visibleText = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()

  return [title, description, visibleText].filter(Boolean).join(' | ').slice(0, 9000)
}

async function readWebsiteContext(website) {
  const targets = [normalizeWebsiteUrl(website, 'https'), normalizeWebsiteUrl(website, 'http')]
    .filter(Boolean)
    .filter((url, index, arr) => arr.indexOf(url) === index)

  if (!targets.length) {
    return { ok: false, url: '', text: '', status: 'No website URL was provided.' }
  }

  let lastError = null

  for (const url of targets) {
    try {
      const text = await Promise.race([
        fetchWebsiteText(url),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Website read timed out')), 8500)),
      ])

      if (text && text.length > 80) {
        return { ok: true, url, text, status: `Read ${Math.min(text.length, 9000)} characters from ${url}` }
      }

      lastError = new Error('Website did not return enough readable text')
    } catch (error) {
      lastError = error
    }
  }

  return {
    ok: false,
    url: targets[0],
    text: '',
    status: lastError ? lastError.message : 'Unable to read website text.',
  }
}

function normalizeCampaign(parsed, { website, business, websiteRead }) {
  const sponsorName = safeText(parsed.sponsorName, inferSponsorName(website, business))
  const hookOptions = Array.isArray(parsed.hookOptions) ? parsed.hookOptions : []
  const storyAngles = Array.isArray(parsed.storyAngles) ? parsed.storyAngles : []
  const offerIdeas = Array.isArray(parsed.offerIdeas) ? parsed.offerIdeas : []
  const landingPageSections = Array.isArray(parsed.landingPageSections) ? parsed.landingPageSections : []
  const packageRecommendations = Array.isArray(parsed.packageRecommendations) ? parsed.packageRecommendations : []
  const followUpIdeas = Array.isArray(parsed.followUpIdeas) ? parsed.followUpIdeas : []
  const warnings = Array.isArray(parsed.warnings) ? parsed.warnings : []
  const clarifyingQuestions = Array.isArray(parsed.clarifyingQuestions) ? parsed.clarifyingQuestions : []

  return {
    sponsorName,
    websiteAnalysis: parsed.websiteAnalysis || {
      confidence: websiteRead.ok ? 'medium' : 'low',
      businessSummary: websiteRead.ok
        ? `Website text was read from ${websiteRead.url}. Review the assumptions below before launch.`
        : `The website could not be read automatically. The AI used the URL and any provided text as a rough clue.`,
      likelyProductsOrServices: [],
      likelyAudience: '',
      likelyPrimaryGoal: '',
      whatToVerify: [websiteRead.status],
    },
    audienceSummary: safeText(parsed.audienceSummary, 'Curious visitors who may care about this offer.'),
    recommendedHook: safeText(parsed.recommendedHook, hookOptions[0]?.hook || 'They have a story behind this offer.'),
    hookOptions,
    storyAngles,
    offerIdeas,
    landingPageSections,
    packageRecommendations,
    followUpIdeas,
    warnings,
    clarifyingQuestions,
    websiteRead,
  }
}

function fallbackCampaign({ website, business, websiteRead, errorMessage }) {
  const sponsorName = inferSponsorName(website, business)
  const sourceNote = websiteRead?.ok
    ? `I was able to read the website text from ${websiteRead.url}, but the AI response failed to parse.`
    : `I could not read the website automatically: ${websiteRead?.status || 'unknown reason'}.`

  return {
    sponsorName,
    websiteAnalysis: {
      confidence: 'low',
      businessSummary: sourceNote,
      likelyProductsOrServices: [],
      likelyAudience: '',
      likelyPrimaryGoal: 'Needs verification',
      whatToVerify: [
        'What exactly are you promoting?',
        'Who should click the hook?',
        'What should the visitor do next?',
      ],
    },
    audienceSummary: 'Needs verification before launch.',
    recommendedHook: `They have a story behind ${sponsorName}.`,
    hookOptions: [
      {
        hook: `They have a story behind ${sponsorName}.`,
        whyItWorks: 'This is a safe placeholder until the business, offer, and audience are verified.',
        bestFor: 'First-pass campaign discovery.'
      },
      {
        hook: `They are giving people a reason to discover ${sponsorName}.`,
        whyItWorks: 'It creates a curiosity gap without making an unsupported claim.',
        bestFor: 'Click-through testing.'
      },
      {
        hook: `They are the answer to a WHOzTHEY? question.`,
        whyItWorks: 'It explains the platform mechanics while staying inside the They Hook format.',
        bestFor: 'Sponsor onboarding.'
      }
    ],
    storyAngles: [
      {
        title: 'Verify the why',
        story: `Before launching ${sponsorName}, confirm the human reason behind the offer. The campaign needs a story that explains why people should care, not just who is behind the click.`,
        emotionalTrigger: 'trust'
      }
    ],
    offerIdeas: [
      {
        offer: 'Send visitors to the existing website while the full offer is clarified.',
        whyItWorks: 'It lets the sponsor start with click-through traffic before building a deeper funnel.',
        suggestedCTA: 'Visit Website'
      }
    ],
    landingPageSections: [
      { section: 'The Claim', copy: 'Repeat the They Hook that got the visitor to click.' },
      { section: 'The Story', copy: 'Explain why the sponsor is worth caring about.' },
      { section: 'The Offer', copy: 'Make the next action clear.' }
    ],
    packageRecommendations: [
      {
        packageName: 'Click-Through Hook',
        bestFor: 'A sponsor whose site or offer is not fully verified yet.',
        why: 'Start simple, track clicks, then upgrade to a story/lead/funnel package after verification.'
      }
    ],
    followUpIdeas: ['Ask the sponsor to verify the website analysis before launch.'],
    warnings: [errorMessage || 'AI generation did not complete cleanly.'],
    clarifyingQuestions: [
      'Is this the right business and offer?',
      'What is the most valuable action a visitor could take?',
      'Is there a human story, cause, mission, or founder reason behind this offer?'
    ],
    websiteRead,
    error: errorMessage,
  }
}

export async function POST(request) {
  let body = {}
  let websiteRead = null

  try {
    body = await request.json()
    const {
      website = '',
      business = '',
      goal = '',
      audience = '',
      story = '',
      offer = '',
    } = body || {}

    if (!`${website}`.trim() && !`${business}`.trim()) {
      return Response.json({ error: 'Add a website or business description first.' }, { status: 400 })
    }

    websiteRead = await readWebsiteContext(website)
    const sponsorNameHint = inferSponsorName(website, business)
    const client = getAnthropicClient()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3200,
      system: `You are the sponsor-campaign strategist for WHOzTHEY?, a curiosity platform where visitors click claims that start with "They..." because they want to know WHOzTHEY? is.

Your job is to act like the marketing expert. Most sponsors will only enter a website. Do not punish them for that. If website text is available, use it as the primary source. If the website text is thin, make smart but clearly-labeled assumptions and ask clarifying questions.

CORE FORMULA:
- YerHook gets attention. It MUST start with "They" and make a curious visitor want to ask WHOzTHEY?
- YerStory earns trust. It explains WHY the sponsor is doing this, why the visitor should care, and what human-interest angle makes the sponsor worth supporting.
- YerOffer creates action. It gives the visitor a clear next step: click, call, book, claim, visit, buy, join, donate, or submit a lead.

FIRST-STAGE WEBSITE-ONLY MODE:
When the user only gives a website, return a website analysis first, then campaign assumptions, then clarifying questions. The output should feel like: "We looked at your site. It looks like you do X for Y. Is that right? Here are the likely best campaign directions."

CRITICAL RULES:
- Give at least 4 hook options, 3 story angles, 3 offer ideas, 5 landing page sections, and 3 package recommendations.
- Be creative, but do not make false or unverifiable claims.
- Do not promise guaranteed income, guaranteed results, cures, legal outcomes, investment returns, or impossible claims.
- If the sponsor has no obvious offer, suggest practical offer types.
- The hook can be bold, but the landing page must pay it off honestly.
- Use clear marketing language a small business owner can understand.

Respond ONLY with valid JSON matching this shape:
{
  "sponsorName": "short name inferred from website/business",
  "websiteAnalysis": {
    "confidence": "high | medium | low",
    "businessSummary": "We looked at your site and it appears you...",
    "likelyProductsOrServices": ["item"],
    "likelyAudience": "who they appear to serve",
    "likelyPrimaryGoal": "what goal seems most likely",
    "whatToVerify": ["specific assumption to verify"]
  },
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
  "warnings": ["compliance or claim-quality warning"],
  "clarifyingQuestions": ["question to ask sponsor before final launch"]
}`,
      messages: [
        {
          role: 'user',
          content: `Build a WHOzTHEY? sponsor campaign from this intake.

Sponsor name hint from URL/text: ${sponsorNameHint}
Website URL entered: ${website || 'none'}
Website read status: ${websiteRead.status}
Website text/context found: ${websiteRead.text || 'No website text available.'}
Business or product description: ${business || 'not provided'}
Goal: ${goal || 'not provided'}
Audience/avatar: ${audience || 'not provided'}
Story/why: ${story || 'not provided'}
Possible offer or next step: ${offer || 'not provided'}

If only the website is provided, begin by analyzing the website and making useful campaign assumptions. Then ask verification questions.`,
        },
      ],
    })

    const raw = message.content?.[0]?.text || ''
    const parsed = extractJson(raw)
    return Response.json(normalizeCampaign(parsed, { website, business, websiteRead }))
  } catch (error) {
    console.error('YerTHEY generation error:', error)
    return Response.json(fallbackCampaign({
      website: body?.website,
      business: body?.business,
      websiteRead: websiteRead || { ok: false, url: '', text: '', status: 'Website was not analyzed.' },
      errorMessage: error.message || 'AI generation failed.',
    }))
  }
}
