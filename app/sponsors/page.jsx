'use client'

import { useState } from 'react'

const DEMO_CLAIMS = [
  'They say an apple a day keeps the doctor away.',
  'They say breakfast is the most important meal of the day.',
  'They say this is the best pizza in town.',
]

const BUSINESS_CLAIMS = [
  'They say Barro\'s Pizza in Chandler has the best pizza in town.',
  'They say Sina\'s Creations makes one-of-a-kind glass gifts people remember.',
  'They say Travel Protection Club helps golfers travel with less stress.',
]

export default function SponsorsPage() {
  const [claim, setClaim] = useState(DEMO_CLAIMS[0])
  const [claimResult, setClaimResult] = useState(null)
  const [claimLoading, setClaimLoading] = useState(false)
  const [website, setWebsite] = useState('')
  const [refinement, setRefinement] = useState('')
  const [campaign, setCampaign] = useState(null)
  const [campaignLoading, setCampaignLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('website')
  const [message, setMessage] = useState('')

  async function runClaimDemo(event) {
    event.preventDefault()
    setClaimLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Unable to run WHOzTHEY? demo')
      setClaimResult(data)
    } catch (error) {
      setMessage(error.message || 'Unable to run WHOzTHEY? demo')
    } finally {
      setClaimLoading(false)
    }
  }

  async function buildCampaign(event) {
    event.preventDefault()
    setCampaignLoading(true)
    setMessage('')
    setActiveTab('website')
    try {
      const response = await fetch('/api/yerthey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          business: refinement,
          goal: 'Infer the best sponsor campaign from the website first, then ask verification questions.',
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Unable to build sponsor campaign')
      setCampaign(data)
    } catch (error) {
      setMessage(error.message || 'Unable to build sponsor campaign')
    } finally {
      setCampaignLoading(false)
    }
  }

  function startVoiceRefinement() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setMessage('Voice input is not available in this browser. Type the refinement instead.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || ''
      setRefinement((current) => current ? `${current} ${transcript}` : transcript)
    }
    recognition.onerror = () => setMessage('Voice input failed. Type the refinement instead.')
    recognition.start()
  }

  return (
    <main className="sponsor-page">
      <style jsx global>{css}</style>

      <header className="topbar">
        <div className="brand">WHOzTHEY?</div>
        <div className="top-pill">Sponsor Campaign Builder</div>
      </header>

      <section className="hero shell">
        <p className="eyebrow">First, understand the platform</p>
        <h1>Everybody has heard <span>They say...</span></h1>
        <p className="lead">
          They say an apple a day keeps the doctor away. They say this is the best pizza in town. WHOzTHEY? asks the question hiding inside every claim: who is they?
        </p>
      </section>

      <section className="shell two-col">
        <div className="panel dark-panel">
          <p className="eyebrow red">Step 1: Test drive WHOzTHEY?</p>
          <h2>Try it like a visitor.</h2>
          <p>Run a normal claim first. Then try a claim about your own business, the way people Google themselves to see what comes up.</p>
          <form onSubmit={runClaimDemo} className="searchbox">
            <textarea value={claim} onChange={(event) => setClaim(event.target.value)} />
            <button type="submit" disabled={claimLoading}>{claimLoading ? 'Asking WHOzTHEY?...' : 'Ask WHOzTHEY?'}</button>
          </form>
          <div className="chips">
            {DEMO_CLAIMS.concat(BUSINESS_CLAIMS).map((sample) => (
              <button key={sample} type="button" onClick={() => setClaim(sample)}>{sample}</button>
            ))}
          </div>
        </div>

        <div className="panel result-panel">
          {!claimResult ? (
            <EmptyCard title="WHOzTHEY?" text="The free result shows how the platform analyzes a claim. A sponsor campaign lets you control what happens after the click." />
          ) : (
            <div>
              <p className="eyebrow red">Free visitor result</p>
              <h2>{claimResult.verdict || 'Claim analyzed'}</h2>
              <p className="gold-text">{claimResult.verdictNote}</p>
              <ResultBlock title="Who is they?" text={claimResult.whoIsThey} />
              <ResultBlock title="Origin" text={claimResult.origin} />
              <ResultBlock title="Sponsor pivot" text="The free result is neutral. A paid sponsor campaign can send visitors to your approved story, offer, coupon, form, booking page, checkout, or website." />
            </div>
          )}
        </div>
      </section>

      <section className="shell pivot">
        <h2>Now imagine your business becoming the answer.</h2>
        <p>The hook earns the click. The story explains why people should care. The offer gives them a reason to act.</p>
      </section>

      <section className="shell two-col">
        <div className="panel form-panel">
          <p className="eyebrow red">Step 2: Start with your website</p>
          <h2>Let the AI make the first move.</h2>
          <p>Most sponsors will only give us a URL. That should be enough to start. Add a voice or typed note only if you want to improve the result.</p>
          <form onSubmit={buildCampaign}>
            <label>
              Website
              <input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://yourbusiness.com" />
            </label>
            <label>
              Optional refinement
              <textarea value={refinement} onChange={(event) => setRefinement(event.target.value)} placeholder="Tell us what we got wrong, what you sell, who you serve, or what offer you want to test." />
            </label>
            <div className="button-row">
              <button type="button" className="secondary" onClick={startVoiceRefinement}>Use Voice</button>
              <button type="submit" disabled={campaignLoading}>{campaignLoading ? 'Scanning website...' : 'Analyze My Website'}</button>
            </div>
          </form>
          {message ? <p className="message">{message}</p> : null}
        </div>

        <div className="panel campaign-panel">
          {!campaign ? (
            <EmptyCard title="Campaign Preview" text="Enter a website and the AI will infer what the business does, who it serves, what to verify, and which sponsor campaign angles may work." />
          ) : (
            <Campaign campaign={campaign} activeTab={activeTab} setActiveTab={setActiveTab} />
          )}
        </div>
      </section>

      <footer className="sponsor-footer">
        <div>
          <strong>Sponsor Hook Preview</strong>
          <span>{campaign?.recommendedHook || 'They are giving people a reason to ask WHOzTHEY?'}</span>
        </div>
      </footer>
    </main>
  )
}

function EmptyCard({ title, text }) {
  return (
    <div className="empty-card">
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  )
}

function ResultBlock({ title, text }) {
  if (!text) return null
  return (
    <div className="result-block">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  )
}

function Campaign({ campaign, activeTab, setActiveTab }) {
  const tabs = [
    ['website', 'Website'],
    ['hooks', 'Hooks'],
    ['story', 'Story'],
    ['offer', 'Offer'],
    ['page', 'Page'],
    ['package', 'Package'],
  ]

  return (
    <div>
      <p className="eyebrow red">AI campaign preview</p>
      <h2>{campaign.sponsorName || 'Sponsor Campaign'}</h2>
      <p className="gold-text">{campaign.recommendedHook}</p>
      <div className="tabs">
        {tabs.map(([key, label]) => <button key={key} type="button" className={activeTab === key ? 'active' : ''} onClick={() => setActiveTab(key)}>{label}</button>)}
      </div>
      {activeTab === 'website' && <WebsitePanel analysis={campaign.websiteAnalysis} questions={campaign.clarifyingQuestions} read={campaign.websiteRead} />}
      {activeTab === 'hooks' && <Cards items={campaign.hookOptions} titleKey="hook" bodyKeys={['whyItWorks', 'bestFor']} />}
      {activeTab === 'story' && <Cards items={campaign.storyAngles} titleKey="title" bodyKeys={['story', 'emotionalTrigger']} />}
      {activeTab === 'offer' && <Cards items={campaign.offerIdeas} titleKey="offer" bodyKeys={['whyItWorks', 'suggestedCTA']} />}
      {activeTab === 'page' && <Cards items={campaign.landingPageSections} titleKey="section" bodyKeys={['copy']} />}
      {activeTab === 'package' && <Cards items={campaign.packageRecommendations} titleKey="packageName" bodyKeys={['bestFor', 'why']} />}
    </div>
  )
}

function WebsitePanel({ analysis, questions, read }) {
  return (
    <div className="stack">
      <ResultBlock title="What we think you do" text={analysis?.businessSummary} />
      <ResultBlock title="Likely audience" text={analysis?.likelyAudience} />
      <ResultBlock title="Likely primary goal" text={analysis?.likelyPrimaryGoal} />
      <ResultBlock title="Website read status" text={read?.status} />
      {Array.isArray(analysis?.likelyProductsOrServices) && analysis.likelyProductsOrServices.length ? (
        <div className="result-block"><strong>Likely products/services</strong><ul>{analysis.likelyProductsOrServices.map((item) => <li key={item}>{item}</li>)}</ul></div>
      ) : null}
      {Array.isArray(questions) && questions.length ? (
        <div className="result-block"><strong>What we should verify</strong><ul>{questions.map((item) => <li key={item}>{item}</li>)}</ul></div>
      ) : null}
    </div>
  )
}

function Cards({ items = [], titleKey, bodyKeys }) {
  if (!items?.length) return <p>No suggestions returned yet. Add a refinement and run again.</p>
  return (
    <div className="stack">
      {items.map((item, index) => (
        <article className="option-card" key={index}>
          <div className="num">{index + 1}</div>
          <div>
            <h3>{item?.[titleKey]}</h3>
            {bodyKeys.map((key) => item?.[key] ? <p key={key}><strong>{labelFor(key)}:</strong> {item[key]}</p> : null)}
          </div>
        </article>
      ))}
    </div>
  )
}

function labelFor(key) {
  return {
    whyItWorks: 'Why it works',
    bestFor: 'Best for',
    story: 'Story',
    emotionalTrigger: 'Emotional trigger',
    suggestedCTA: 'CTA',
    copy: 'Copy',
    why: 'Why',
  }[key] || key
}

const css = `
  :root { --red:#dc2626; --navy:#131720; --cream:#f9f3e9; --gold:#f6c453; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--cream); }
  .sponsor-page { min-height:100vh; padding-bottom:86px; background:linear-gradient(180deg,var(--navy) 0,#202638 560px,var(--cream) 560px); color:var(--navy); font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
  .topbar { position:sticky; top:0; z-index:10; display:flex; justify-content:space-between; align-items:center; gap:14px; padding:12px 20px; background:rgba(19,23,32,.94); color:#fff; border-bottom:1px solid rgba(255,255,255,.12); }
  .brand { font-weight:1000; font-size:24px; color:#fff; letter-spacing:-1px; }
  .top-pill,.eyebrow { display:inline-flex; width:max-content; border-radius:999px; background:var(--red); color:#fff; padding:7px 11px; font-size:11px; font-weight:950; text-transform:uppercase; letter-spacing:.5px; }
  .eyebrow.red { background:transparent; color:var(--red); padding:0; border-radius:0; }
  .shell { max-width:1120px; margin:0 auto; padding-left:20px; padding-right:20px; }
  .hero { padding-top:56px; color:#fff; }
  .hero h1 { max-width:860px; margin:18px 0 14px; font-size:clamp(42px,7vw,82px); line-height:.9; letter-spacing:-2px; }
  .hero h1 span { color:var(--gold); }
  .lead { max-width:840px; font-size:21px; line-height:1.45; color:#fff7ed; }
  .two-col { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-top:24px; align-items:stretch; }
  .panel { border-radius:24px; padding:24px; background:#fff; box-shadow:0 18px 55px rgba(19,23,32,.16); }
  .dark-panel { background:#232938; color:#fff; border:1px solid rgba(255,255,255,.12); }
  .dark-panel p { color:#e5e7eb; }
  .panel h2 { margin:10px 0; font-size:32px; line-height:1.02; letter-spacing:-.8px; }
  .searchbox textarea, label textarea, label input { width:100%; border:1px solid #d7dce3; border-radius:16px; padding:14px; font-size:16px; line-height:1.4; outline:none; }
  .searchbox textarea { min-height:118px; margin-top:14px; }
  .searchbox button, form button { margin-top:12px; border:0; border-radius:999px; background:var(--red); color:#fff; padding:13px 18px; font-weight:950; cursor:pointer; }
  button:disabled { opacity:.65; cursor:wait; }
  .chips { display:flex; flex-wrap:wrap; gap:8px; margin-top:16px; }
  .chips button { border:1px solid rgba(255,255,255,.16); background:rgba(255,255,255,.08); color:#fff; border-radius:999px; padding:8px 10px; font-size:12px; font-weight:800; cursor:pointer; }
  .empty-card { min-height:360px; display:grid; place-items:center; align-content:center; text-align:center; background:#fff8ee; border-radius:18px; padding:24px; }
  .empty-card h2 { color:var(--red); font-size:42px; }
  .empty-card p { max-width:520px; color:#5d6472; line-height:1.5; }
  .gold-text { color:var(--gold); font-size:22px; font-weight:950; line-height:1.3; }
  .result-block { background:#fbfaf7; border:1px solid #efe6d8; border-radius:16px; padding:14px; margin-top:12px; }
  .result-block p { margin:8px 0 0; line-height:1.45; color:#394150; }
  .pivot { margin-top:28px; padding-top:24px; padding-bottom:24px; color:#111827; text-align:center; }
  .pivot h2 { margin:0; font-size:40px; letter-spacing:-1.2px; }
  .pivot p { max-width:760px; margin:10px auto 0; font-size:18px; color:#4b5563; }
  label { display:block; margin-top:15px; font-size:13px; font-weight:950; }
  label input, label textarea { margin-top:7px; font-weight:500; }
  label textarea { min-height:112px; }
  .button-row { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
  .button-row .secondary { background:#fff; color:var(--navy); border:1px solid #d7dce3; }
  .message { color:var(--red); font-weight:850; }
  .tabs { display:flex; gap:8px; flex-wrap:wrap; margin:14px 0; }
  .tabs button { border:1px solid #d7dce3; background:#fff; border-radius:999px; padding:8px 12px; font-weight:950; cursor:pointer; }
  .tabs button.active { color:#fff; background:var(--red); border-color:var(--red); }
  .stack { display:grid; gap:12px; }
  .option-card { display:grid; grid-template-columns:34px 1fr; gap:12px; padding:16px; border:1px solid #efe6d8; border-radius:16px; background:#fbfaf7; }
  .num { width:30px; height:30px; display:grid; place-items:center; border-radius:50%; color:#fff; background:var(--red); font-weight:950; }
  .option-card h3 { margin:0 0 8px; color:var(--red); font-size:18px; line-height:1.2; }
  .option-card p { margin:8px 0 0; line-height:1.45; color:#394150; }
  .sponsor-footer { position:fixed; left:0; right:0; bottom:0; z-index:20; padding:10px 18px; background:var(--navy); color:#fff; border-top:1px solid rgba(255,255,255,.16); }
  .sponsor-footer div { max-width:1120px; margin:0 auto; display:flex; gap:14px; align-items:center; justify-content:center; flex-wrap:wrap; }
  .sponsor-footer strong { color:var(--gold); text-transform:uppercase; font-size:12px; letter-spacing:.8px; }
  .sponsor-footer span { font-weight:900; }
  @media (max-width:860px) { .two-col { grid-template-columns:1fr; } .hero { padding-top:36px; } .hero h1 { font-size:44px; } .lead { font-size:18px; } .panel { padding:18px; } .topbar { align-items:flex-start; flex-direction:column; } }
`
