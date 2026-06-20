'use client'

import { useMemo, useState } from 'react'

const BRAND_RED = '#dc2626'
const BRAND_NAVY = '#131720'
const BRAND_CREAM = '#f9f3e9'
const BRAND_GOLD = '#f6c453'
const BRAND_GREEN = '#15803d'

const GOALS = [
  'Send visitors to my website or offer page',
  'Capture leads I can follow up with',
  'Get phone calls or appointments',
  'Drive visits to my location',
  'Sell something online',
  'Promote an event, cause, product, or idea',
  'Build awareness for my brand or story',
]

const EXAMPLES = [
  'They are moving out of your dream house.',
  'They are giving traveling golfers $75 toward ShipSticks.',
  'They are giving away free pizza in Chandler.',
  'They are helping people feel safer when they travel.',
]

function cleanUrl(url) {
  if (!url) return ''
  return url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0]
}

function inferName(url, description) {
  const host = cleanUrl(url)
  if (host) {
    const root = host.split('.')[0]
    return root
      .split(/[-_]/g)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }

  const words = (description || '').trim().split(/\s+/).filter(Boolean)
  if (words.length) return words.slice(0, 3).join(' ')
  return 'Your Business'
}

function actionLabel(goal) {
  if (!goal) return 'Take the Next Step'
  if (goal.includes('website')) return 'Visit My Site'
  if (goal.includes('leads')) return 'Send Me the Details'
  if (goal.includes('phone') || goal.includes('appointments')) return 'Book a Call'
  if (goal.includes('location')) return 'Get Directions'
  if (goal.includes('Sell')) return 'Buy Now'
  if (goal.includes('event')) return 'Learn More'
  return 'Take the Next Step'
}

function buildCampaign(form) {
  const sponsorName = inferName(form.website, form.business)
  const audience = form.audience || 'people who are already curious about what you do'
  const story = form.story || 'there is a real reason behind what you do, and the right audience should hear it before they see another generic ad'
  const offer = form.offer || 'a clear next step that makes it easy for someone to learn more, claim something, book a call, or visit your page'
  const goal = form.goal || GOALS[0]
  const cta = actionLabel(goal)

  const baseThing = form.business || form.website || 'a business, product, cause, offer, or idea worth discovering'

  const hooks = [
    `They are helping ${audience} discover ${baseThing}.`,
    `They have a reason for doing this that makes the offer worth clicking.`,
    `They are giving people a better reason to pay attention than another boring ad.`,
    `They are making an offer with a story behind it.`,
    `They are the answer to a WHOzTHEY? question.`
  ]

  const stories = [
    `${sponsorName} is not just trying to get a click. They are using a WHOzTHEY? hook to introduce the story behind their offer: ${story}.`,
    `The hook creates curiosity, but the story earns trust. In this campaign, ${sponsorName} should explain why this offer matters, who it helps, and why now is the right time for people to respond.`,
    `A visitor may click because the claim sounds interesting. They should stay because ${sponsorName} gives them a human reason to care.`
  ]

  const offers = [
    offer,
    `A simple ${cta.toLowerCase()} offer tied directly to the visitor's curiosity.`,
    `A low-friction first step: let visitors learn the story, then invite them to act.`
  ]

  return {
    sponsorName,
    hook: hooks[0],
    hooks,
    stories,
    offers,
    page: {
      headline: `WHOzTHEY? ${sponsorName}.`,
      subhead: `They made a claim worth clicking. Here is the story behind it, the reason it matters, and the next step if you want to learn more.`,
      sections: [
        'The Claim: the curiosity hook visitors clicked.',
        'The Story: why the sponsor is doing this and why people should care.',
        'The Offer: the next step, claim, booking, visit, purchase, or lead form.',
        'The Action: the button or form that turns curiosity into a measurable result.'
      ],
      cta,
    },
    packages: [
      {
        name: 'Click-Through Hook',
        bestFor: 'Sponsors who already have a website, booking page, store, video, or offer link.',
        includes: ['They Hook creation', 'Sponsor placement', 'Click tracking', 'Traffic sent to your link'],
      },
      {
        name: 'Story + Lead Capture',
        bestFor: 'Sponsors who want names, emails, calls, coupons, appointments, or qualified leads.',
        includes: ['They Hook', 'Hosted WHOzTHEY? story page', 'Lead form or CTA', 'Lead delivery/reporting'],
      },
      {
        name: 'Full Funnel Campaign',
        bestFor: 'Sponsors who want WHOzTHEY? to build the hook, story, page, follow-up, and conversion path.',
        includes: ['Everything above', 'Offer strategy', 'Follow-up copy', 'Stripe or automation planning'],
      },
    ]
  }
}

export default function YerTheySponsorBuilder() {
  const [form, setForm] = useState({
    website: '',
    business: '',
    goal: GOALS[0],
    audience: '',
    story: '',
    offer: '',
  })
  const [generated, setGenerated] = useState(false)
  const [activeTab, setActiveTab] = useState('hook')

  const campaign = useMemo(() => buildCampaign(form), [form])

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleGenerate = (event) => {
    event.preventDefault()
    setGenerated(true)
    setActiveTab('hook')
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.badge}>WHOzTHEY? Sponsor Builder</div>
        <h1 style={styles.h1}>Do you want to be the answer to a WHOzTHEY? question?</h1>
        <p style={styles.lede}>
          Visitors come to WHOzTHEY? in curiosity mode. Sponsors create a <strong>They...</strong> hook that makes people click. Then your story and offer become the answer.
        </p>
        <div style={styles.formulaGrid}>
          <FormulaCard title="YerHook" text="Gets attention with a claim that starts with They." />
          <FormulaCard title="YerStory" text="Explains why people should care about the sponsor behind the claim." />
          <FormulaCard title="YerOffer" text="Turns curiosity into a click, lead, call, visit, booking, or sale." />
        </div>
      </section>

      <section style={styles.examplesWrap}>
        <p style={styles.kicker}>Example sponsor hooks</p>
        <div style={styles.examples}>
          {EXAMPLES.map((example) => <span key={example} style={styles.exampleChip}>{example}</span>)}
        </div>
      </section>

      <section style={styles.builderGrid}>
        <form style={styles.card} onSubmit={handleGenerate}>
          <div style={styles.sectionHeader}>
            <span style={styles.step}>1</span>
            <div>
              <h2 style={styles.h2}>Tell us what you want to promote.</h2>
              <p style={styles.muted}>Start with a website, or describe what the page would say if you had one.</p>
            </div>
          </div>

          <label style={styles.label}>Website URL</label>
          <input
            value={form.website}
            onChange={(event) => update('website', event.target.value)}
            placeholder="https://example.com"
            style={styles.input}
          />

          <label style={styles.label}>No website? What are you selling, promoting, or trying to grow?</label>
          <textarea
            value={form.business}
            onChange={(event) => update('business', event.target.value)}
            placeholder="Example: annual travel membership for golfers, local pizza shop, real estate buyer alerts, fundraiser, creator page..."
            style={styles.textarea}
          />

          <label style={styles.label}>What is your goal?</label>
          <select value={form.goal} onChange={(event) => update('goal', event.target.value)} style={styles.input}>
            {GOALS.map((goal) => <option key={goal}>{goal}</option>)}
          </select>

          <label style={styles.label}>WHOz attention do you want to capture?</label>
          <input
            value={form.audience}
            onChange={(event) => update('audience', event.target.value)}
            placeholder="Example: traveling golfers, Chandler homeowners, local families, new patients..."
            style={styles.input}
          />

          <label style={styles.label}>What is the human story or why behind this?</label>
          <textarea
            value={form.story}
            onChange={(event) => update('story', event.target.value)}
            placeholder="Why are you doing this? Who are you helping? What makes people say, that's cool, I want to support them?"
            style={styles.textarea}
          />

          <label style={styles.label}>What could the visitor do next?</label>
          <textarea
            value={form.offer}
            onChange={(event) => update('offer', event.target.value)}
            placeholder="Example: claim a voucher, book a call, join a list, visit a location, buy online, donate, register..."
            style={styles.textarea}
          />

          <button type="submit" style={styles.primaryButton}>Generate My Sponsor Hook</button>
        </form>

        <section style={styles.resultCard}>
          {!generated ? (
            <div style={styles.placeholder}>
              <div style={styles.bigQuestion}>WHOzTHEY?</div>
              <h2 style={styles.h2}>You could be.</h2>
              <p style={styles.mutedLarge}>
                Fill out the form and this builder will create a starting campaign: hooks, story angles, offer ideas, a page outline, and package recommendations.
              </p>
            </div>
          ) : (
            <CampaignResult campaign={campaign} activeTab={activeTab} setActiveTab={setActiveTab} />
          )}
        </section>
      </section>
    </main>
  )
}

function FormulaCard({ title, text }) {
  return (
    <div style={styles.formulaCard}>
      <h3 style={styles.h3}>{title}</h3>
      <p style={styles.cardText}>{text}</p>
    </div>
  )
}

function CampaignResult({ campaign, activeTab, setActiveTab }) {
  const tabs = [
    ['hook', 'YerHook'],
    ['story', 'YerStory'],
    ['offer', 'YerOffer'],
    ['page', 'YerPage'],
    ['package', 'Best Package'],
  ]

  return (
    <div>
      <div style={styles.resultTop}>
        <p style={styles.kicker}>Generated starting point</p>
        <h2 style={styles.resultTitle}>{campaign.sponsorName}</h2>
        <p style={styles.generatedHook}>{campaign.hook}</p>
      </div>

      <div style={styles.tabs}>
        {tabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            style={activeTab === key ? styles.tabActive : styles.tab}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'hook' && <ListPanel title="Hook options" items={campaign.hooks} note="The hook should be true, interesting, and specific enough to make a curious visitor click." />}
      {activeTab === 'story' && <ListPanel title="Story angles" items={campaign.stories} note="This is the emotional bridge between curiosity and trust." />}
      {activeTab === 'offer' && <ListPanel title="Offer ideas" items={campaign.offers} note="The offer should make the next step obvious and measurable." />}
      {activeTab === 'page' && <PagePanel page={campaign.page} />}
      {activeTab === 'package' && <PackagePanel packages={campaign.packages} />}
    </div>
  )
}

function ListPanel({ title, items, note }) {
  return (
    <div style={styles.panel}>
      <h3 style={styles.panelTitle}>{title}</h3>
      <ol style={styles.list}>
        {items.map((item, index) => <li key={`${item}-${index}`} style={styles.listItem}>{item}</li>)}
      </ol>
      <p style={styles.note}>{note}</p>
    </div>
  )
}

function PagePanel({ page }) {
  return (
    <div style={styles.panel}>
      <h3 style={styles.panelTitle}>{page.headline}</h3>
      <p style={styles.pageSubhead}>{page.subhead}</p>
      <div style={styles.pagePreview}>
        {page.sections.map((section) => <div key={section} style={styles.previewRow}>{section}</div>)}
        <button type="button" style={styles.previewButton}>{page.cta}</button>
      </div>
    </div>
  )
}

function PackagePanel({ packages }) {
  return (
    <div style={styles.panel}>
      <h3 style={styles.panelTitle}>Recommended activation levels</h3>
      <div style={styles.packageGrid}>
        {packages.map((pkg) => (
          <div key={pkg.name} style={styles.packageCard}>
            <h4 style={styles.packageTitle}>{pkg.name}</h4>
            <p style={styles.packageBest}>{pkg.bestFor}</p>
            <ul style={styles.packageList}>
              {pkg.includes.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    margin: 0,
    background: `linear-gradient(135deg, ${BRAND_NAVY} 0%, #202636 52%, ${BRAND_CREAM} 52%, ${BRAND_CREAM} 100%)`,
    color: BRAND_NAVY,
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: '28px',
  },
  hero: {
    maxWidth: 1120,
    margin: '0 auto',
    color: BRAND_CREAM,
    padding: '26px 0 18px',
  },
  badge: {
    display: 'inline-flex',
    background: BRAND_RED,
    color: '#fff',
    borderRadius: 999,
    padding: '8px 14px',
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  h1: {
    fontSize: 'clamp(38px, 6vw, 72px)',
    lineHeight: 0.92,
    margin: '22px 0 14px',
    maxWidth: 900,
    letterSpacing: -1.5,
  },
  lede: {
    maxWidth: 820,
    fontSize: 20,
    lineHeight: 1.45,
    color: '#fff7ed',
  },
  formulaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 14,
    marginTop: 24,
  },
  formulaCard: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.22)',
    borderRadius: 18,
    padding: 18,
    backdropFilter: 'blur(8px)',
  },
  h3: {
    margin: '0 0 8px',
    color: BRAND_GOLD,
    fontSize: 18,
  },
  cardText: {
    margin: 0,
    color: '#fff7ed',
    lineHeight: 1.45,
  },
  examplesWrap: {
    maxWidth: 1120,
    margin: '8px auto 18px',
    background: 'rgba(249,243,233,0.9)',
    border: '1px solid rgba(19,23,32,0.1)',
    borderRadius: 20,
    padding: 18,
  },
  kicker: {
    margin: '0 0 10px',
    color: BRAND_RED,
    fontWeight: 900,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  examples: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
  },
  exampleChip: {
    background: '#fff',
    border: '1px solid #e7dccb',
    borderRadius: 999,
    padding: '9px 12px',
    fontSize: 14,
    fontWeight: 800,
  },
  builderGrid: {
    maxWidth: 1120,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'minmax(300px, 0.86fr) minmax(320px, 1.14fr)',
    gap: 22,
    alignItems: 'stretch',
  },
  card: {
    background: '#fff',
    borderRadius: 24,
    padding: 24,
    boxShadow: '0 18px 60px rgba(19,23,32,0.18)',
  },
  resultCard: {
    background: '#fff',
    borderRadius: 24,
    padding: 24,
    boxShadow: '0 18px 60px rgba(19,23,32,0.18)',
    minHeight: 560,
  },
  sectionHeader: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  step: {
    background: BRAND_RED,
    color: '#fff',
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
  },
  h2: {
    margin: 0,
    fontSize: 26,
    lineHeight: 1.05,
  },
  muted: {
    color: '#5d6472',
    lineHeight: 1.45,
    margin: '6px 0 0',
  },
  label: {
    display: 'block',
    margin: '14px 0 7px',
    fontWeight: 900,
    fontSize: 13,
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #d7dce3',
    borderRadius: 14,
    padding: '13px 14px',
    fontSize: 15,
    outline: 'none',
  },
  textarea: {
    width: '100%',
    minHeight: 86,
    boxSizing: 'border-box',
    border: '1px solid #d7dce3',
    borderRadius: 14,
    padding: '13px 14px',
    fontSize: 15,
    lineHeight: 1.4,
    resize: 'vertical',
    outline: 'none',
  },
  primaryButton: {
    width: '100%',
    marginTop: 18,
    border: 0,
    borderRadius: 16,
    background: BRAND_RED,
    color: '#fff',
    padding: '15px 18px',
    fontSize: 17,
    fontWeight: 950,
    cursor: 'pointer',
    boxShadow: '0 12px 24px rgba(220,38,38,0.28)',
  },
  placeholder: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: 30,
    background: BRAND_CREAM,
    borderRadius: 20,
  },
  bigQuestion: {
    fontSize: 52,
    fontWeight: 1000,
    color: BRAND_RED,
    letterSpacing: -2,
    marginBottom: 8,
  },
  mutedLarge: {
    maxWidth: 520,
    color: '#5d6472',
    fontSize: 17,
    lineHeight: 1.5,
  },
  resultTop: {
    background: BRAND_NAVY,
    color: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  resultTitle: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1,
  },
  generatedHook: {
    margin: '14px 0 0',
    fontSize: 22,
    lineHeight: 1.3,
    color: BRAND_GOLD,
    fontWeight: 900,
  },
  tabs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  tab: {
    border: '1px solid #d7dce3',
    background: '#fff',
    color: BRAND_NAVY,
    borderRadius: 999,
    padding: '9px 12px',
    fontWeight: 900,
    cursor: 'pointer',
  },
  tabActive: {
    border: `1px solid ${BRAND_RED}`,
    background: BRAND_RED,
    color: '#fff',
    borderRadius: 999,
    padding: '9px 12px',
    fontWeight: 900,
    cursor: 'pointer',
  },
  panel: {
    background: '#fbfaf7',
    border: '1px solid #efe6d8',
    borderRadius: 20,
    padding: 20,
  },
  panelTitle: {
    margin: '0 0 14px',
    fontSize: 24,
    lineHeight: 1.1,
  },
  list: {
    paddingLeft: 22,
    margin: 0,
  },
  listItem: {
    marginBottom: 12,
    lineHeight: 1.45,
    fontWeight: 650,
  },
  note: {
    margin: '16px 0 0',
    padding: 14,
    borderRadius: 14,
    background: '#fff',
    color: BRAND_GREEN,
    fontWeight: 850,
  },
  pageSubhead: {
    color: '#394150',
    lineHeight: 1.5,
    fontSize: 16,
  },
  pagePreview: {
    display: 'grid',
    gap: 10,
    marginTop: 14,
  },
  previewRow: {
    background: '#fff',
    border: '1px solid #eee2d1',
    borderRadius: 14,
    padding: 13,
    fontWeight: 750,
  },
  previewButton: {
    justifySelf: 'start',
    marginTop: 4,
    border: 0,
    background: BRAND_RED,
    color: '#fff',
    borderRadius: 999,
    padding: '12px 16px',
    fontWeight: 950,
  },
  packageGrid: {
    display: 'grid',
    gap: 12,
  },
  packageCard: {
    background: '#fff',
    border: '1px solid #eee2d1',
    borderRadius: 16,
    padding: 16,
  },
  packageTitle: {
    margin: 0,
    fontSize: 18,
    color: BRAND_RED,
  },
  packageBest: {
    margin: '8px 0 10px',
    color: '#394150',
    lineHeight: 1.45,
  },
  packageList: {
    margin: 0,
    paddingLeft: 20,
    lineHeight: 1.6,
  },
}
