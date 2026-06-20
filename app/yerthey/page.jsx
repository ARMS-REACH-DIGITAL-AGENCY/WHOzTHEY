'use client'

import { useState } from 'react'

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

const EMPTY_FORM = {
  website: '',
  business: '',
  goal: GOALS[0],
  audience: '',
  story: '',
  offer: '',
}

export default function YerTheySponsorBuilder() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [campaign, setCampaign] = useState(null)
  const [activeTab, setActiveTab] = useState('hooks')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function generateCampaign(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setActiveTab('hooks')

    try {
      const response = await fetch('/api/yerthey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to generate campaign')
      }

      setCampaign(data)
    } catch (err) {
      setError(err.message || 'Unable to generate campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="yt-page">
      <style jsx global>{css}</style>

      <section className="yt-hero">
        <div className="yt-badge">WHOzTHEY? Sponsor Builder</div>
        <h1>Do you want to be the answer to a WHOzTHEY? question?</h1>
        <p className="yt-lede">
          Visitors come to WHOzTHEY? in curiosity mode. Sponsors create a <strong>They...</strong> hook that makes people click. Then the sponsor's story and offer become the answer.
        </p>

        <div className="yt-formula">
          <FormulaCard title="YerHook" text="Gets attention with a claim that starts with They." />
          <FormulaCard title="YerStory" text="Answers why the sponsor is worth caring about." />
          <FormulaCard title="YerOffer" text="Turns curiosity into a click, lead, call, visit, booking, or sale." />
        </div>
      </section>

      <section className="yt-examples">
        <p className="yt-kicker">Example sponsor hooks</p>
        <div className="yt-chip-row">
          {EXAMPLES.map((example) => (
            <span className="yt-chip" key={example}>{example}</span>
          ))}
        </div>
      </section>

      <section className="yt-builder">
        <form className="yt-card yt-form" onSubmit={generateCampaign}>
          <div className="yt-step-title">
            <span>1</span>
            <div>
              <h2>Tell us what you want to promote.</h2>
              <p>Give the AI enough context to generate multiple hook, story, offer, page, and package options.</p>
            </div>
          </div>

          <Field label="Website URL">
            <input value={form.website} onChange={(event) => update('website', event.target.value)} placeholder="https://example.com" />
          </Field>

          <Field label="No website? What are you selling, promoting, or trying to grow?">
            <textarea value={form.business} onChange={(event) => update('business', event.target.value)} placeholder="Example: annual travel membership for golfers, local pizza shop, real estate buyer alerts, fundraiser, creator page..." />
          </Field>

          <Field label="What is your goal?">
            <select value={form.goal} onChange={(event) => update('goal', event.target.value)}>
              {GOALS.map((goal) => <option key={goal}>{goal}</option>)}
            </select>
          </Field>

          <Field label="WHOz attention do you want to capture?">
            <input value={form.audience} onChange={(event) => update('audience', event.target.value)} placeholder="Example: traveling golfers, Chandler homeowners, local families, new patients..." />
          </Field>

          <Field label="What is the human story or why behind this?">
            <textarea value={form.story} onChange={(event) => update('story', event.target.value)} placeholder="Why are you doing this? Who are you helping? What makes people say, that's cool, I want to support them?" />
          </Field>

          <Field label="What could the visitor do next?">
            <textarea value={form.offer} onChange={(event) => update('offer', event.target.value)} placeholder="Example: claim a voucher, book a call, join a list, visit a location, buy online, donate, register..." />
          </Field>

          {error ? <p className="yt-error">{error}</p> : null}
          <button className="yt-primary" type="submit" disabled={loading}>{loading ? 'Generating campaign...' : 'Generate My Sponsor Campaign'}</button>
        </form>

        <section className="yt-card yt-results">
          {!campaign ? (
            <div className="yt-empty">
              <div>WHOzTHEY?</div>
              <h2>You could be.</h2>
              <p>This version is wired to the YerTHEY AI route. It should return multiple hooks, story angles, offers, landing-page sections, package recommendations, follow-up ideas, and claim-quality warnings.</p>
            </div>
          ) : (
            <CampaignResult campaign={campaign} activeTab={activeTab} setActiveTab={setActiveTab} />
          )}
        </section>
      </section>
    </main>
  )
}

function Field({ label, children }) {
  return (
    <label className="yt-field">
      <span>{label}</span>
      {children}
    </label>
  )
}

function FormulaCard({ title, text }) {
  return (
    <div className="yt-formula-card">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

function CampaignResult({ campaign, activeTab, setActiveTab }) {
  const tabs = [
    ['hooks', 'YerHooks'],
    ['stories', 'YerStories'],
    ['offers', 'YerOffers'],
    ['page', 'YerPage'],
    ['packages', 'Packages'],
    ['followup', 'Follow-Up'],
  ]

  return (
    <div>
      <div className="yt-result-hero">
        <p className="yt-kicker">AI-generated campaign strategy</p>
        <h2>{campaign.sponsorName || 'Sponsor Campaign'}</h2>
        <p className="yt-recommended">{campaign.recommendedHook || 'They have a story worth clicking.'}</p>
        <p className="yt-audience">{campaign.audienceSummary}</p>
      </div>

      <div className="yt-tabs">
        {tabs.map(([key, label]) => (
          <button key={key} type="button" onClick={() => setActiveTab(key)} className={activeTab === key ? 'active' : ''}>{label}</button>
        ))}
      </div>

      {activeTab === 'hooks' && <HookPanel items={campaign.hookOptions || []} />}
      {activeTab === 'stories' && <StoryPanel items={campaign.storyAngles || []} />}
      {activeTab === 'offers' && <OfferPanel items={campaign.offerIdeas || []} />}
      {activeTab === 'page' && <LandingPagePanel items={campaign.landingPageSections || []} />}
      {activeTab === 'packages' && <PackagePanel items={campaign.packageRecommendations || []} />}
      {activeTab === 'followup' && <FollowUpPanel items={campaign.followUpIdeas || []} warnings={campaign.warnings || []} />}
    </div>
  )
}

function HookPanel({ items }) {
  return (
    <Panel title="Multiple YerHook options">
      {items.map((item, index) => (
        <article className="yt-option" key={`${item.hook}-${index}`}>
          <div className="yt-number">{index + 1}</div>
          <div>
            <h3>{item.hook}</h3>
            <p><strong>Why it works:</strong> {item.whyItWorks}</p>
            <p><strong>Best for:</strong> {item.bestFor}</p>
          </div>
        </article>
      ))}
    </Panel>
  )
}

function StoryPanel({ items }) {
  return (
    <Panel title="Multiple YerStory angles">
      {items.map((item, index) => (
        <article className="yt-option" key={`${item.title}-${index}`}>
          <div className="yt-number">{index + 1}</div>
          <div>
            <h3>{item.title}</h3>
            <p>{item.story}</p>
            <p><strong>Emotional trigger:</strong> {item.emotionalTrigger}</p>
          </div>
        </article>
      ))}
    </Panel>
  )
}

function OfferPanel({ items }) {
  return (
    <Panel title="Multiple YerOffer ideas">
      {items.map((item, index) => (
        <article className="yt-option" key={`${item.offer}-${index}`}>
          <div className="yt-number">{index + 1}</div>
          <div>
            <h3>{item.offer}</h3>
            <p><strong>Why it works:</strong> {item.whyItWorks}</p>
            <p><strong>CTA:</strong> {item.suggestedCTA}</p>
          </div>
        </article>
      ))}
    </Panel>
  )
}

function LandingPagePanel({ items }) {
  return (
    <Panel title="YerPage landing-page draft">
      {items.map((item, index) => (
        <article className="yt-option" key={`${item.section}-${index}`}>
          <div className="yt-number">{index + 1}</div>
          <div>
            <h3>{item.section}</h3>
            <p>{item.copy}</p>
          </div>
        </article>
      ))}
    </Panel>
  )
}

function PackagePanel({ items }) {
  return (
    <Panel title="Recommended activation levels">
      {items.map((item, index) => (
        <article className="yt-option" key={`${item.packageName}-${index}`}>
          <div className="yt-number">{index + 1}</div>
          <div>
            <h3>{item.packageName}</h3>
            <p><strong>Best for:</strong> {item.bestFor}</p>
            <p><strong>Why:</strong> {item.why}</p>
          </div>
        </article>
      ))}
    </Panel>
  )
}

function FollowUpPanel({ items, warnings }) {
  return (
    <Panel title="Follow-up ideas and guardrails">
      <h3 className="yt-subhead">Follow-up ideas</h3>
      {items.map((item, index) => <p className="yt-bullet" key={`${item}-${index}`}>{index + 1}. {item}</p>)}
      <h3 className="yt-subhead">Claim-quality warnings</h3>
      {warnings.map((item, index) => <p className="yt-warning" key={`${item}-${index}`}>{item}</p>)}
    </Panel>
  )
}

function Panel({ title, children }) {
  return (
    <div className="yt-panel">
      <h2>{title}</h2>
      <div className="yt-options">{children}</div>
    </div>
  )
}

const css = `
  :root {
    --red: #dc2626;
    --navy: #131720;
    --cream: #f9f3e9;
    --gold: #f6c453;
    --green: #15803d;
  }

  * { box-sizing: border-box; }

  body { margin: 0; }

  .yt-page {
    min-height: 100vh;
    padding: 28px;
    background: linear-gradient(135deg, var(--navy) 0%, #222838 53%, var(--cream) 53%, var(--cream) 100%);
    color: var(--navy);
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .yt-hero, .yt-examples, .yt-builder { max-width: 1120px; margin: 0 auto; }

  .yt-hero { color: var(--cream); padding: 26px 0 18px; }

  .yt-badge {
    display: inline-flex;
    background: var(--red);
    color: white;
    border-radius: 999px;
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .5px;
  }

  .yt-hero h1 {
    max-width: 920px;
    margin: 22px 0 14px;
    font-size: clamp(38px, 6vw, 72px);
    line-height: .92;
    letter-spacing: -1.6px;
  }

  .yt-lede { max-width: 820px; font-size: 20px; line-height: 1.45; color: #fff7ed; }

  .yt-formula { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 24px; }

  .yt-formula-card {
    padding: 18px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,.22);
    background: rgba(255,255,255,.1);
  }

  .yt-formula-card h3 { margin: 0 0 8px; color: var(--gold); }
  .yt-formula-card p { margin: 0; line-height: 1.45; color: #fff7ed; }

  .yt-examples {
    margin-top: 8px;
    margin-bottom: 18px;
    padding: 18px;
    border-radius: 20px;
    background: rgba(249,243,233,.92);
    border: 1px solid rgba(19,23,32,.1);
  }

  .yt-kicker { margin: 0 0 10px; color: var(--red); font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
  .yt-chip-row { display: flex; gap: 10px; flex-wrap: wrap; }
  .yt-chip { background: white; border: 1px solid #e7dccb; border-radius: 999px; padding: 9px 12px; font-weight: 850; font-size: 14px; }

  .yt-builder { display: grid; grid-template-columns: .86fr 1.14fr; gap: 22px; align-items: start; }
  .yt-card { background: white; border-radius: 24px; padding: 24px; box-shadow: 0 18px 60px rgba(19,23,32,.18); }

  .yt-step-title { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 18px; }
  .yt-step-title span { flex: 0 0 32px; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 50%; background: var(--red); color: white; font-weight: 900; }
  .yt-step-title h2 { margin: 0; font-size: 28px; line-height: 1; }
  .yt-step-title p { margin: 6px 0 0; color: #5d6472; line-height: 1.4; }

  .yt-field { display: block; margin-top: 14px; }
  .yt-field span { display: block; margin-bottom: 7px; font-size: 13px; font-weight: 900; }
  .yt-field input, .yt-field textarea, .yt-field select {
    width: 100%;
    border: 1px solid #d7dce3;
    border-radius: 14px;
    padding: 13px 14px;
    font-size: 15px;
    line-height: 1.4;
    outline: none;
    background: white;
  }
  .yt-field textarea { min-height: 92px; resize: vertical; }

  .yt-error { margin: 14px 0 0; color: var(--red); font-weight: 850; }
  .yt-primary { width: 100%; margin-top: 18px; border: 0; border-radius: 16px; padding: 15px 18px; background: var(--red); color: white; font-size: 17px; font-weight: 950; cursor: pointer; box-shadow: 0 12px 24px rgba(220,38,38,.28); }
  .yt-primary:disabled { opacity: .65; cursor: wait; }

  .yt-empty { min-height: 560px; display: grid; place-items: center; text-align: center; background: var(--cream); border-radius: 20px; padding: 30px; }
  .yt-empty div { font-size: 52px; font-weight: 1000; color: var(--red); letter-spacing: -2px; }
  .yt-empty h2 { margin: 6px 0 0; font-size: 28px; }
  .yt-empty p { max-width: 560px; color: #5d6472; font-size: 17px; line-height: 1.5; }

  .yt-result-hero { padding: 20px; border-radius: 20px; background: var(--navy); color: white; margin-bottom: 16px; }
  .yt-result-hero h2 { margin: 0; font-size: 34px; line-height: 1; }
  .yt-recommended { margin: 14px 0 6px; color: var(--gold); font-size: 24px; line-height: 1.25; font-weight: 950; }
  .yt-audience { margin: 0; color: #e5e7eb; line-height: 1.45; }

  .yt-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
  .yt-tabs button { border: 1px solid #d7dce3; background: white; border-radius: 999px; padding: 9px 12px; font-weight: 900; cursor: pointer; }
  .yt-tabs button.active { border-color: var(--red); background: var(--red); color: white; }

  .yt-panel { padding: 20px; border-radius: 20px; background: #fbfaf7; border: 1px solid #efe6d8; }
  .yt-panel > h2 { margin: 0 0 14px; font-size: 24px; line-height: 1.1; }
  .yt-options { display: grid; gap: 12px; }
  .yt-option { display: grid; grid-template-columns: 34px 1fr; gap: 12px; padding: 16px; border: 1px solid #eee2d1; border-radius: 16px; background: white; }
  .yt-number { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 50%; background: var(--red); color: white; font-weight: 900; }
  .yt-option h3 { margin: 0 0 8px; color: var(--red); font-size: 18px; line-height: 1.2; }
  .yt-option p { margin: 8px 0 0; color: #394150; line-height: 1.45; }
  .yt-subhead { margin: 14px 0 8px; color: var(--red); }
  .yt-bullet, .yt-warning { margin: 8px 0; padding: 12px; border-radius: 12px; background: white; line-height: 1.4; }
  .yt-warning { border-left: 4px solid var(--gold); }

  @media (max-width: 840px) {
    .yt-page { padding: 18px; background: linear-gradient(180deg, var(--navy) 0%, #222838 46%, var(--cream) 46%, var(--cream) 100%); }
    .yt-hero h1 { font-size: 40px; letter-spacing: -1px; }
    .yt-lede { font-size: 17px; }
    .yt-formula, .yt-builder { grid-template-columns: 1fr; }
    .yt-card { padding: 18px; }
    .yt-result-hero h2 { font-size: 28px; }
    .yt-recommended { font-size: 20px; }
    .yt-empty { min-height: 360px; }
    .yt-empty div { font-size: 40px; }
  }
`
