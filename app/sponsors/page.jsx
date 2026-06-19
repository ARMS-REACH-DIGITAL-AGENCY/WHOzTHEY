'use client'

import { useState } from 'react'
import { SPONSOR_TIERS } from '../../lib/sponsorTiers'

const TIER_LIST = Object.values(SPONSOR_TIERS)

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

export default function SponsorsPage() {
  const [tierKey, setTierKey] = useState('starter')
  const [form, setForm] = useState({
    sponsorName: '',
    contactName: '',
    contactEmail: '',
    claimText: '',
    ctaUrl: '',
    logoUrl: '',
    accentColor: '#dc2626',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/sponsors/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierKey, ...form }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'Something went wrong.')
      window.location.href = data.checkoutUrl
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: '40px 20px 80px', fontFamily: 'inherit', color: '#1a1a1a' }}>
      <header style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, marginBottom: 8 }}>Become a WHOzTHEY? Founding Sponsor</h1>
        <p style={{ fontSize: 18, color: '#555', maxWidth: 640, margin: '0 auto' }}>
          We don't sell ads. We sell <strong>THEY Hooks</strong> — curiosity-driven placements that
          read like "They say..." claims, not interruptions. Pick a hook, set your message, go live in minutes.
        </p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 40 }}>
        {TIER_LIST.map((tier) => (
          <TierCard key={tier.key} tier={tier} selected={tierKey === tier.key} onSelect={setTierKey} />
        ))}
      </section>

      <section style={{ border: '1px solid #ddd', borderRadius: 12, padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Start your campaign — {SPONSOR_TIERS[tierKey].name}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Company / brand name</span>
            <input
              required
              value={form.sponsorName}
              onChange={(e) => update('sponsorName', e.target.value)}
              style={inputStyle}
            />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Your name</span>
              <input value={form.contactName} onChange={(e) => update('contactName', e.target.value)} style={inputStyle} />
            </label>
            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Email</span>
              <input
                required
                type="email"
                value={form.contactEmail}
                onChange={(e) => update('contactEmail', e.target.value)}
                style={inputStyle}
              />
            </label>
          </div>
          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              Your "They say..." hook (the claim/teaser users will see)
            </span>
            <textarea
              required
              rows={2}
              placeholder='They say golfers can claim a free $75 voucher this month...'
              value={form.claimText}
              onChange={(e) => update('claimText', e.target.value)}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </label>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Logo URL (optional)</span>
              <input
                type="url"
                value={form.logoUrl}
                onChange={(e) => update('logoUrl', e.target.value)}
                style={inputStyle}
              />
            </label>
            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Accent color</span>
              <input
                type="color"
                value={form.accentColor}
                onChange={(e) => update('accentColor', e.target.value)}
                style={{ ...inputStyle, padding: 4, height: 40 }}
              />
            </label>
          </div>

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
            {submitting ? 'Redirecting to checkout…' : `Continue to checkout — $${SPONSOR_TIERS[tierKey].monthlyPrice}/mo`}
          </button>
          <p style={{ fontSize: 12, color: '#888', textAlign: 'center', margin: 0 }}>
            Secure payment via Stripe. Cancel anytime. Your hook goes live automatically the moment payment succeeds.
          </p>
        </form>
      </section>

      <section style={{ marginTop: 48 }}>
        <h2>How it works</h2>
        <ol style={{ fontSize: 15, lineHeight: 1.8 }}>
          <li>Pick a tier and write your hook above — no design or dev work required.</li>
          <li>Pay securely through Stripe. Your campaign activates automatically.</li>
          <li>Your hook appears in the WHOzTHEY? footer carousel and gets tracked in real time.</li>
          <li>Check your results anytime at the dashboard link from your confirmation email.</li>
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
