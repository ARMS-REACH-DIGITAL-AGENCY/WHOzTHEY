'use client'

import { useState } from 'react'

const TABS = [
  ['origin', '⌖', 'TRY IT'],
  ['website', '⌂', 'WEBSITE'],
  ['hooks', '⟲', 'HOOKS'],
  ['story', '✦', 'STORY'],
  ['offer', '☑', 'OFFER'],
  ['package', '▣', 'PACKAGE'],
]

const DEMO_CLAIMS = [
  'They say an apple a day keeps the doctor away.',
  'They say this is the best pizza in town.',
  'They say Barro\'s Pizza in Chandler has the best pizza in town.',
  'They say Sina\'s Creations makes one-of-a-kind glass gifts people remember.',
]

export default function SponsorsPage() {
  const [activeTab, setActiveTab] = useState('origin')
  const [claim, setClaim] = useState(DEMO_CLAIMS[0])
  const [website, setWebsite] = useState('')
  const [refinement, setRefinement] = useState('')
  const [claimResult, setClaimResult] = useState(null)
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const isSponsorTab = ['website', 'hooks', 'story', 'offer', 'package'].includes(activeTab)

  async function runClaimDemo() {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Unable to run claim')
      setClaimResult(data)
      setActiveTab('origin')
    } catch (error) {
      setMessage(error.message || 'Unable to run claim')
    } finally {
      setLoading(false)
    }
  }

  async function analyzeWebsite() {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/yerthey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          business: refinement,
          goal: 'Website-first sponsor campaign. Infer what the company does, then recommend hooks, story, offer, page, and package.',
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Unable to analyze website')
      setCampaign(data)
      setActiveTab('website')
    } catch (error) {
      setMessage(error.message || 'Unable to analyze website')
    } finally {
      setLoading(false)
    }
  }

  function useVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setMessage('Voice input is not available in this browser. Type the note instead.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || ''
      setRefinement((current) => current ? `${current} ${transcript}` : transcript)
    }
    recognition.onerror = () => setMessage('Voice input failed. Type the note instead.')
    recognition.start()
  }

  return (
    <main className="wt-app">
      <style jsx global>{css}</style>

      <header className="wt-top">
        <div className="wt-top-row">
          <div className="wt-title">TYPE A CLAIM OR WEBSITE BELOW<br />TO SEE WHO <span>“THEY”</span> ARE</div>
          <div className="wt-actions">
            <button type="button" onClick={() => setActiveTab('origin')}>✦<small>Try</small></button>
            <button type="button" onClick={() => { setClaimResult(null); setCampaign(null); setActiveTab('origin') }}>↺<small>Reset</small></button>
            <button type="button" onClick={useVoice}>◉<small>Voice</small></button>
          </div>
        </div>

        <section className="wt-input-card">
          <div className="wt-input-prefix">They say,</div>
          <textarea
            value={isSponsorTab ? website : claim}
            onChange={(event) => isSponsorTab ? setWebsite(event.target.value) : setClaim(event.target.value)}
            placeholder={isSponsorTab ? 'Enter sponsor website...' : 'Enter a They say claim...'}
          />
          <button type="button" className="wt-go" onClick={isSponsorTab ? analyzeWebsite : runClaimDemo} disabled={loading}>
            {loading ? '...' : isSponsorTab ? 'SCAN' : 'ASK'}
          </button>
        </section>

        <nav className="wt-tabs">
          {TABS.map(([key, icon, label]) => (
            <button key={key} type="button" className={activeTab === key ? 'active' : ''} onClick={() => setActiveTab(key)}>
              <span>{icon}</span>
              <strong>{label}</strong>
            </button>
          ))}
        </nav>
      </header>

      <section className="wt-content">
        {message ? <div className="wt-alert">{message}</div> : null}
        {activeTab === 'origin' && <OriginPanel setClaim={setClaim} runClaimDemo={runClaimDemo} claimResult={claimResult} />}
        {activeTab === 'website' && <WebsitePanel website={website} setWebsite={setWebsite} refinement={refinement} setRefinement={setRefinement} analyzeWebsite={analyzeWebsite} useVoice={useVoice} campaign={campaign} loading={loading} />}
        {activeTab === 'hooks' && <Cards title="SPONSOR HOOKS" intro="These are the click-worthy sponsor claims visitors could see inside WHOzTHEY?." items={campaign?.hookOptions} titleKey="hook" bodyKeys={['whyItWorks','bestFor']} />}
        {activeTab === 'story' && <Cards title="SPONSOR STORY" intro="The story makes the click feel earned, human, and trustworthy." items={campaign?.storyAngles} titleKey="title" bodyKeys={['story','emotionalTrigger']} />}
        {activeTab === 'offer' && <Cards title="SPONSOR OFFER" intro="The offer gives the visitor a reason to act after curiosity is created." items={campaign?.offerIdeas} titleKey="offer" bodyKeys={['whyItWorks','suggestedCTA']} />}
        {activeTab === 'package' && <Cards title="RECOMMENDED PACKAGE" intro="The AI recommends the path most likely to match the sponsor goal." items={campaign?.packageRecommendations} titleKey="packageName" bodyKeys={['bestFor','why']} />}
      </section>

      <footer className="wt-footer">
        <button type="button">‹</button>
        <div>
          <strong>★ SPONSOR HOOK PREVIEW</strong>
          <p>{campaign?.recommendedHook || 'They are giving people a reason to ask WHOzTHEY?'}</p>
        </div>
        <button type="button">›</button>
      </footer>
    </main>
  )
}

function OriginPanel({ setClaim, runClaimDemo, claimResult }) {
  return (
    <div className="wt-page-section">
      <p className="wt-red-label">WHOzTHEY? — THE SPONSOR ORIGIN</p>
      <h1>Everybody has heard “They say...”</h1>
      <p className="wt-big-copy">WHOzTHEY? starts with the phrase people use when a claim floats through culture without a clear source. Before sponsors can advertise here, they need to experience how visitors ask: who is “they”?</p>
      <div className="wt-callout dark">
        <h2>Try it as a visitor first.</h2>
        <p>Run a normal claim, then run one about your business. The free result is neutral. A sponsor campaign gives the business control over what appears after the click.</p>
        <div className="wt-sample-grid">
          {DEMO_CLAIMS.map((sample) => <button type="button" key={sample} onClick={() => setClaim(sample)}>{sample}</button>)}
        </div>
        <button type="button" className="wt-red-btn" onClick={runClaimDemo}>Ask WHOzTHEY?</button>
      </div>
      {claimResult ? (
        <div className="wt-result-stack">
          <p className="wt-red-label">FREE VISITOR RESULT</p>
          <h2>{claimResult.verdict}</h2>
          <p className="wt-gold">{claimResult.verdictNote}</p>
          <InfoCard title="Who is they?" text={claimResult.whoIsThey} />
          <InfoCard title="Origin" text={claimResult.origin} />
          <InfoCard title="Sponsor pivot" text="The free result is neutral. A sponsor campaign can send visitors to an approved story, offer, coupon, form, booking page, checkout, or website." />
        </div>
      ) : null}
    </div>
  )
}

function WebsitePanel({ website, setWebsite, refinement, setRefinement, analyzeWebsite, useVoice, campaign, loading }) {
  return (
    <div className="wt-page-section">
      <p className="wt-red-label">WEBSITE SCAN</p>
      <h1>Start with the sponsor website.</h1>
      <p className="wt-big-copy">Most sponsors will only enter a URL. The AI should look at the website first, infer what the business does, then ask what needs to be verified.</p>
      <div className="wt-form-card">
        <label>Website</label>
        <input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://yourbusiness.com" />
        <label>Optional typed or voice note</label>
        <textarea value={refinement} onChange={(event) => setRefinement(event.target.value)} placeholder="Tell us what we got wrong, what you sell, who you serve, or what offer you want to test." />
        <div className="wt-btn-row">
          <button type="button" className="wt-light-btn" onClick={useVoice}>Use Voice</button>
          <button type="button" className="wt-red-btn" onClick={analyzeWebsite} disabled={loading}>{loading ? 'Scanning...' : 'Analyze Website'}</button>
        </div>
      </div>
      {campaign ? (
        <div className="wt-result-stack">
          <p className="wt-red-label">WHAT WE THINK WE FOUND</p>
          <h2>{campaign.sponsorName}</h2>
          <p className="wt-gold">{campaign.recommendedHook}</p>
          <InfoCard title="Business summary" text={campaign.websiteAnalysis?.businessSummary} />
          <InfoCard title="Likely audience" text={campaign.websiteAnalysis?.likelyAudience} />
          <InfoCard title="Likely goal" text={campaign.websiteAnalysis?.likelyPrimaryGoal} />
          <InfoCard title="Website read status" text={campaign.websiteRead?.status} />
          {Array.isArray(campaign.clarifyingQuestions) && campaign.clarifyingQuestions.length ? <ListCard title="What to verify" items={campaign.clarifyingQuestions} /> : null}
        </div>
      ) : null}
    </div>
  )
}

function Cards({ title, intro, items = [], titleKey, bodyKeys }) {
  return (
    <div className="wt-page-section">
      <p className="wt-red-label">{title}</p>
      <h1>{title}</h1>
      <p className="wt-big-copy">{intro}</p>
      {!items?.length ? <InfoCard title="No campaign yet" text="Scan a sponsor website first, then this tab will fill with AI-generated recommendations." /> : (
        <div className="wt-card-grid">
          {items.map((item, index) => (
            <article className="wt-suggestion" key={index}>
              <span>{index + 1}</span>
              <div>
                <h2>{item?.[titleKey]}</h2>
                {bodyKeys.map((key) => item?.[key] ? <p key={key}><strong>{labelFor(key)}:</strong> {item[key]}</p> : null)}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function InfoCard({ title, text }) {
  if (!text) return null
  return <div className="wt-info-card"><h2>{title}</h2><p>{text}</p></div>
}

function ListCard({ title, items }) {
  return <div className="wt-info-card"><h2>{title}</h2><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></div>
}

function labelFor(key) {
  return { whyItWorks: 'Why it works', bestFor: 'Best for', story: 'Story', emotionalTrigger: 'Emotional trigger', suggestedCTA: 'CTA', why: 'Why' }[key] || key
}

const css = `
  :root{--navy:#0f1726;--navy2:#172235;--red:#dc2626;--cream:#f9f3e9;--gold:#f6c453;--muted:#768195}*{box-sizing:border-box}body{margin:0;background:#fff;color:#172033}.wt-app{min-height:100vh;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding-bottom:118px}.wt-top{position:sticky;top:0;z-index:30;background:linear-gradient(180deg,var(--navy),#10182a);color:#fff;box-shadow:0 8px 18px rgba(0,0,0,.25)}.wt-top-row{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;padding:18px 26px 12px;max-width:860px;margin:0 auto}.wt-title{font-size:20px;line-height:1.05;font-weight:950;letter-spacing:2px}.wt-title span{color:var(--red)}.wt-actions{display:flex;gap:18px}.wt-actions button{background:transparent;border:0;color:#9aa5b8;font-size:26px;display:grid;gap:2px;text-align:center}.wt-actions small{font-size:12px}.wt-input-card{max-width:820px;margin:6px auto 20px;background:#1f2b3e;border-radius:18px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:8px;padding:16px 20px}.wt-input-prefix{color:var(--red);font-family:Georgia,serif;font-size:28px;font-weight:900}.wt-input-card textarea{height:64px;resize:none;border:0;outline:0;background:transparent;color:#fff;font-family:Georgia,serif;font-weight:900;text-align:center;font-size:26px;line-height:1.1}.wt-go{width:68px;height:52px;border:2px solid rgba(255,255,255,.12);background:#121b2c;color:#fff;border-radius:16px;font-weight:950}.wt-tabs{max-width:860px;margin:0 auto;display:grid;grid-template-columns:repeat(6,1fr)}.wt-tabs button{background:transparent;border:0;color:#718097;padding:12px 4px 16px;border-bottom:4px solid transparent;font-weight:950;letter-spacing:1px}.wt-tabs button span{display:block;font-size:30px}.wt-tabs button strong{font-size:14px}.wt-tabs button.active{color:#fff;border-bottom-color:var(--red)}.wt-content{max-width:760px;margin:0 auto;padding:34px 28px}.wt-page-section h1{font-size:32px;line-height:1.18;margin:16px 0 20px;letter-spacing:-.5px}.wt-red-label{color:var(--red);font-weight:950;text-transform:uppercase;letter-spacing:3px;margin:0}.wt-big-copy{font-size:27px;line-height:1.75;font-weight:650}.wt-callout.dark{background:var(--navy);color:#fff;border-radius:16px;padding:26px;margin:28px 0}.wt-callout h2{font-family:Georgia,serif;font-size:28px}.wt-callout p{font-size:18px;line-height:1.5;color:#e7edf7}.wt-sample-grid{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0}.wt-sample-grid button{border:1px solid rgba(255,255,255,.16);background:#223047;color:#fff;border-radius:999px;padding:9px 12px;font-weight:850}.wt-red-btn,.wt-light-btn{border:0;border-radius:10px;padding:13px 18px;font-size:16px;font-weight:950}.wt-red-btn{background:var(--red);color:#fff}.wt-light-btn{background:#fff;color:var(--navy);border:1px solid #dbe1ea}.wt-form-card{background:#f7f9fc;border-radius:18px;padding:22px;border-left:6px solid var(--red);margin:24px 0}.wt-form-card label{display:block;font-size:13px;font-weight:950;text-transform:uppercase;letter-spacing:1.4px;color:#758194;margin:14px 0 6px}.wt-form-card input,.wt-form-card textarea{width:100%;border:1px solid #d9e0ea;border-radius:12px;padding:14px;font-size:18px}.wt-form-card textarea{min-height:110px}.wt-btn-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.wt-result-stack{display:grid;gap:14px;margin-top:28px}.wt-info-card{background:#fbfaf7;border:1px solid #eadfce;border-radius:16px;padding:18px}.wt-info-card h2{font-size:18px;margin:0 0 10px}.wt-info-card p,.wt-info-card li{font-size:19px;line-height:1.55;color:#394150}.wt-gold{font-size:25px;line-height:1.35;color:var(--gold);font-weight:950}.wt-alert{background:#fff3f3;color:var(--red);padding:12px 16px;border-radius:12px;margin-bottom:18px;font-weight:850}.wt-card-grid{display:grid;gap:14px}.wt-suggestion{display:grid;grid-template-columns:42px 1fr;gap:14px;border:1px solid #e2e8f0;background:#fbfaf7;border-radius:16px;padding:18px}.wt-suggestion span{width:34px;height:34px;border-radius:50%;background:var(--red);color:#fff;display:grid;place-items:center;font-weight:950}.wt-suggestion h2{font-size:21px;margin:0 0 8px;color:var(--red)}.wt-suggestion p{font-size:17px;line-height:1.45}.wt-footer{position:fixed;bottom:0;left:0;right:0;z-index:40;background:#111a2b;color:#fff;border-top:1px solid rgba(255,255,255,.12);display:grid;grid-template-columns:48px 1fr 48px;align-items:center;min-height:88px}.wt-footer button{height:100%;border:0;background:transparent;color:#fff;font-size:34px}.wt-footer div{text-align:center}.wt-footer strong{display:block;color:#fff;letter-spacing:2px}.wt-footer p{margin:10px auto 0;max-width:680px;font-family:Georgia,serif;font-size:24px;font-weight:900}.wt-footer p::first-letter{color:var(--red)}@media(max-width:700px){.wt-top-row{padding:14px 18px 10px}.wt-title{font-size:17px}.wt-actions{gap:10px}.wt-input-card{margin:6px 18px 14px;grid-template-columns:1fr auto}.wt-input-prefix{grid-column:1/2;font-size:24px}.wt-input-card textarea{grid-column:1/2;text-align:left;font-size:22px}.wt-go{grid-column:2;grid-row:1/3}.wt-tabs button strong{font-size:11px}.wt-tabs button span{font-size:24px}.wt-content{padding:28px 22px}.wt-big-copy{font-size:23px;line-height:1.65}.wt-page-section h1{font-size:29px}.wt-footer p{font-size:20px}}
`
