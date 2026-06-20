'use client'

import { useMemo, useState } from 'react'
import { SPONSOR_TIERS } from '../../lib/sponsorTiers'
import { SponsorFooterBar, SponsorResultPanel } from '../../components/SponsorHookPreview'

const TIER_LIST = Object.values(SPONSOR_TIERS)
const LEAD_FIELD_OPTIONS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
]

function TierCard({ tier, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(tier.key)}
      style={{
        textAlign: 'left',
        cursor: 'pointer',
        border: selected ? '2px solid #dc2626' : '1px solid #ddd',
        borderRadius: 12,
        padding: 20,
        background: selected ? '#fff5f5' : '#fff',
        width: '100%',
        fontFamily: 'inherit',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h3 style={{ margin: 0, fontSize: 20 }}>{tier.name}</h3>
        <span style={{ background: '#dc2626', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
          FOUNDING SPONSOR
        </span>
      </div>
      <div style={{ marginTop: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 700 }}>${tier.monthlyPrice}</span>
        <span style={{ color: '#666' }}>/mo</span>
        <span style={{ marginLeft: 8, color: '#999', textDecoration: 'line-through', fontSize: 14 }}>
          ${tier.standardPrice}/mo
        </span>
      </div>
      <p style={{ fontSize: 13, color: '#666', margin: '6px 0' }}>Locked for your first 6 months</p>
      <p style={{ fontSize: 14, margin: '10px 0' }}>{tier.description}</p>
      <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
        Goal: <strong>{tier.goal}</strong> · Funnel: {tier.funnelModes}
      </p>
    </button>
  )
}

const DEFAULT_FORM = {
  sponsorName: '',
  contactName: '',
  contactEmail: '',
  claimText: '',
  revealBody: '',
  ctaLabel: '',
  ctaUrl: '',
  logoUrl: '',
  accentColor: '#dc2626',
  leadFields: ['name', 'email'],
  leadQuestion: '',
}

export default function SponsorsPage() {
  const [tierKey, setTierKey] = useState('starter')
  const [form, setForm] = useState(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [aiNote, setAiNote] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const tier = SPONSOR_TIERS[tierKey]

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleLeadField(key) {
    setForm((prev) => ({
      ...prev,
      leadFields: prev.leadFields.includes(key)
        ? prev.leadFields.filter((f) => f !== key)
        : [...prev.leadFields, key],
    }))
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/sponsors/upload-logo', { method: 'POST', body })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'Upload failed.')
      update('logoUrl', data.url)
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleAiFill() {
    if (!form.logoUrl) return
    setAiLoading(true)
    setAiError(null)
    setAiNote(null)
    try {
      const res = await fetch('/api/sponsors/ai-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: form.logoUrl, sponsorName: form.sponsorName, notes: form.claimText }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'AI could not analyze that image.')
      setForm((prev) => ({
        ...prev,
        accentColor: data.suggestions.accentColor || prev.accentColor,
        claimText: data.suggestions.claimText || prev.claimText,
        revealBody: data.suggestions.revealBody || prev.revealBody,
        ctaLabel: data.suggestions.ctaLabel || prev.ctaLabel,
      }))
      setAiNote('AI suggestions applied below — edit anything before you go live.')
    } catch (err) {
      setAiError(err.message)
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/sponsors/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierKey,
          ...form,
          leadFields: tier.leadCapture ? { fields: form.leadFields, question: form.leadQuestion } : undefined,
        }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'Something went wrong.')
      window.location.href = data.checkoutUrl
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  const previewSponsor = useMemo(
    () => ({
      id: 'preview',
      sponsor: form.sponsorName || 'Your Brand',
      badge: 'SPONSORED',
      teaser: form.claimText || 'They say something curious is about to happen here...',
      body: form.revealBody,
      cta: form.ctaLabel || 'Learn More →',
      ctaUrl: form.ctaUrl,
      accent: form.accentColor,
      logoUrl: form.logoUrl,
      leadFields: tier.leadCapture && form.leadFields.length ? { fields: form.leadFields, question: form.leadQuestion } : null,
    }),
    [form, tier]
  )

  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: '40px 20px 80px', fontFamily: 'inherit', color: '#1a1a1a' }}>
      <header style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, marginBottom: 8 }}>Become a WHOzTHEY? Founding Sponsor</h1>
        <p style={{ fontSize: 18, color: '#555', maxWidth: 640, margin: '0 auto' }}>
          We don't sell ads. We sell <strong>THEY Hooks</strong> — curiosity-driven claims that make people ask
          "WHOzTHEY?" and click to find out. We build the landing experience for you and connect it to your ARMS
          pipeline to manage, nurture, and close the leads it generates.
        </p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 40 }}>
        {TIER_LIST.map((t) => (
          <TierCard key={t.key} tier={t} selected={tierKey === t.key} onSelect={(key) => { setTierKey(key); setPreviewOpen(false) }} />
        ))}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
        <section style={{ border: '1px solid #ddd', borderRadius: 12, padding: 24 }}>
          <h2 style={{ marginTop: 0 }}>Start your campaign — {tier.name}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Company / brand name</span>
              <input required value={form.sponsorName} onChange={(e) => update('sponsorName', e.target.value)} style={inputStyle} />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Your name</span>
                <input value={form.contactName} onChange={(e) => update('contactName', e.target.value)} style={inputStyle} />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Email</span>
                <input required type="email" value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} style={inputStyle} />
              </label>
            </div>

            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Your "They say..." hook (the claim/teaser users will see)</span>
              <textarea
                required
                rows={2}
                placeholder='They say golfers can claim a free $75 voucher this month...'
                value={form.claimText}
                onChange={(e) => update('claimText', e.target.value)}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </label>

            <div style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Logo or mockup</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoUpload} disabled={uploading} />
                {uploading && <span style={{ fontSize: 12, color: '#666' }}>Uploading…</span>}
                {form.logoUrl && <img src={form.logoUrl} alt="Logo preview" style={{ height: 32, borderRadius: 4 }} />}
              </div>
              {uploadError && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{uploadError}</p>}
              <input
                type="url"
                placeholder="...or paste a logo URL"
                value={form.logoUrl}
                onChange={(e) => update('logoUrl', e.target.value)}
                style={{ ...inputStyle, marginTop: 4 }}
              />
              <button
                type="button"
                onClick={handleAiFill}
                disabled={!form.logoUrl || aiLoading}
                style={{
                  marginTop: 6,
                  alignSelf: 'flex-start',
                  padding: '8px 14px',
                  background: !form.logoUrl ? '#f1f5f9' : '#0f172a',
                  color: !form.logoUrl ? '#94a3b8' : '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: !form.logoUrl || aiLoading ? 'default' : 'pointer',
                }}
              >
                {aiLoading ? 'Analyzing…' : '✨ AI-fill hook from my logo/mockup'}
              </button>
              {aiNote && <p style={{ fontSize: 12, color: '#16a34a', margin: 0 }}>{aiNote}</p>}
              {aiError && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{aiError}</p>}
            </div>

            {(tier.defaultLinkMode === 'panel' || tier.leadCapture) && (
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Reveal pitch (shown after they click "WHOzTHEY?")</span>
                <textarea
                  rows={2}
                  placeholder="Tell them the real offer/story here..."
                  value={form.revealBody}
                  onChange={(e) => update('revealBody', e.target.value)}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </label>
            )}

            {tier.leadCapture ? (
              <div style={{ display: 'grid', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>What should we collect from each lead?</span>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {LEAD_FIELD_OPTIONS.map((opt) => (
                    <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                      <input type="checkbox" checked={form.leadFields.includes(opt.key)} onChange={() => toggleLeadField(opt.key)} />
                      {opt.label}
                    </label>
                  ))}
                </div>
                <input
                  placeholder="Optional qualifying question (e.g. What service are you interested in?)"
                  value={form.leadQuestion}
                  onChange={(e) => update('leadQuestion', e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="url"
                  placeholder="Fallback link (optional) — shown if you'd rather they visit a page too"
                  value={form.ctaUrl}
                  onChange={(e) => update('ctaUrl', e.target.value)}
                  style={inputStyle}
                />
              </div>
            ) : (
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Where should clicks go?</span>
                <input
                  required
                  type="url"
                  placeholder="https://yoursite.com/offer"
                  value={form.ctaUrl}
                  onChange={(e) => update('ctaUrl', e.target.value)}
                  style={inputStyle}
                />
              </label>
            )}

            {tier.defaultLinkMode === 'panel' && (
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Button label</span>
                <input
                  placeholder="Claim Your Voucher →"
                  value={form.ctaLabel}
                  onChange={(e) => update('ctaLabel', e.target.value)}
                  style={inputStyle}
                />
              </label>
            )}

            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Accent color</span>
              <input type="color" value={form.accentColor} onChange={(e) => update('accentColor', e.target.value)} style={{ ...inputStyle, padding: 4, height: 40, maxWidth: 80 }} />
            </label>

            {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              style={{
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '14px 20px',
                fontSize: 16,
                fontWeight: 700,
                cursor: submitting ? 'default' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Redirecting to checkout…' : `Continue to checkout — $${tier.monthlyPrice}/mo`}
            </button>
            <p style={{ fontSize: 12, color: '#888', textAlign: 'center', margin: 0 }}>
              Secure payment via Stripe. Cancel anytime. Your hook goes live automatically the moment payment succeeds.
            </p>
          </form>
        </section>

        <div style={{ position: 'sticky', top: 24, display: 'grid', gap: 16 }}>
          <section style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16, background: '#0f172a' }}>
            <p style={{ fontFamily: 'system-ui', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 10px' }}>
              Live preview — this is exactly what visitors will see
            </p>
            <SponsorFooterBar
              sponsor={previewSponsor}
              onOpen={() => {
                if (tier.defaultLinkMode === 'direct') return
                setPreviewOpen((v) => !v)
              }}
            />
            {tier.defaultLinkMode === 'direct' && (
              <p style={{ fontSize: 11, color: '#64748b', margin: '8px 0 0' }}>
                On the live site, clicking this opens your link directly in a new tab.
              </p>
            )}
          </section>

          {previewOpen && tier.defaultLinkMode === 'panel' && (
            <section style={{ border: '1px solid #ddd', borderRadius: 12, overflow: 'hidden' }}>
              <SponsorResultPanel sponsor={previewSponsor} previewOnly />
            </section>
          )}

          <section style={{ border: '1px dashed #cbd5e1', borderRadius: 12, padding: 18, textAlign: 'center' }}>
            <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>Need something more custom?</p>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#666' }}>
              Multi-step funnels, quizzes, or a fully managed ARMS campaign — let's talk it through.
            </p>
            <a
              href={process.env.NEXT_PUBLIC_CALL_BOOKING_URL || 'mailto:hello@whozthey.com?subject=Custom%20WHOzTHEY%20Campaign'}
              style={{ display: 'inline-block', padding: '10px 18px', background: '#0f172a', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}
            >
              Book a call →
            </a>
          </section>
        </div>
      </div>

      <section style={{ marginTop: 48 }}>
        <h2>How it works</h2>
        <ol style={{ fontSize: 15, lineHeight: 1.8 }}>
          <li>Pick a tier, write your hook, and preview it live above — no design or dev work required.</li>
          <li>Pay securely through Stripe. Your campaign activates automatically.</li>
          <li>Your hook appears in the WHOzTHEY? footer carousel and gets tracked in real time.</li>
          <li>Leads and clicks flow into your dashboard — and into your ARMS pipeline once connected.</li>
          <li>Add more hooks for different offers anytime from your dashboard link.</li>
        </ol>
      </section>
    </main>
  )
}

const inputStyle = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #ccc',
  fontSize: 14,
  fontFamily: 'inherit',
}
