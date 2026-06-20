'use client'

import { useState } from 'react'

// Shared between the live site (WHOzTHEY.jsx) and the sponsor self-serve
// preview (app/sponsors/page.jsx) so what a sponsor previews while building
// their hook is pixel-identical to what visitors actually see.

export function renderSponsorTeaser(text) {
  const match = (text || '').match(/^(They)\b/i)
  if (!match) return text
  return (
    <>
      <span style={{ color: '#dc2626' }}>{match[1]}</span>
      {text.slice(match[1].length)}
    </>
  )
}

function SponsorLeadForm({ sponsor, onSubmit, disabled }) {
  const fields = sponsor.leadFields?.fields || []
  const [values, setValues] = useState({ name: '', email: '', phone: '', answer: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (submitted) {
    return (
      <p style={{ fontFamily: 'system-ui', fontSize: 14, color: '#16a34a', fontWeight: 700, margin: 0 }}>
        ✓ Got it — {sponsor.sponsor} will be in touch.
      </p>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (disabled) return
    setSubmitting(true)
    try {
      await onSubmit(values)
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
      {fields.includes('name') && (
        <input
          required
          placeholder="Your name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          style={leadInputStyle}
        />
      )}
      {fields.includes('email') && (
        <input
          required
          type="email"
          placeholder="Your email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          style={leadInputStyle}
        />
      )}
      {fields.includes('phone') && (
        <input
          type="tel"
          placeholder="Your phone"
          value={values.phone}
          onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
          style={leadInputStyle}
        />
      )}
      {sponsor.leadFields?.question && (
        <input
          placeholder={sponsor.leadFields.question}
          value={values.answer}
          onChange={(e) => setValues((v) => ({ ...v, answer: e.target.value }))}
          style={leadInputStyle}
        />
      )}
      <button
        type="submit"
        disabled={submitting || disabled}
        style={{
          padding: '11px 18px',
          background: sponsor.accent,
          border: 'none',
          borderRadius: 7,
          color: '#fff',
          fontFamily: 'system-ui',
          fontSize: 13,
          fontWeight: 700,
          cursor: submitting || disabled ? 'default' : 'pointer',
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? 'Sending…' : sponsor.cta}
      </button>
    </form>
  )
}

const leadInputStyle = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  fontSize: 14,
  fontFamily: 'inherit',
  background: '#0f172a',
  color: '#f8fafc',
}

// `sponsor` shape: { sponsor, badge, teaser, body, cta, ctaUrl, accent, leadFields }
export function SponsorResultPanel({ sponsor, onClear, onLeadSubmit, previewOnly }) {
  if (!sponsor) return null
  const hasLeadForm = sponsor.leadFields?.fields?.length > 0

  return (
    <section style={{ background: '#fff', borderBottom: '3px solid #e2e8f0' }}>
      <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '20px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {sponsor.logoUrl && (
              <img src={sponsor.logoUrl} alt={sponsor.sponsor} style={{ height: 32, width: 32, objectFit: 'contain', borderRadius: 4 }} />
            )}
            <div>
              <p style={{ fontFamily: 'system-ui', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: sponsor.accent, margin: '0 0 4px' }}>
                {sponsor.badge} · {sponsor.sponsor}
              </p>
              <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>
                {renderSponsorTeaser(sponsor.teaser)}
              </h2>
            </div>
          </div>
          {onClear && (
            <button onClick={onClear} style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: 4, color: '#64748b', fontSize: 11, fontFamily: 'system-ui', padding: '3px 10px', cursor: 'pointer', flexShrink: 0 }}>
              Close ✕
            </button>
          )}
        </div>
      </div>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: 24 }}>
        <div style={{ background: '#0f172a', borderLeft: `4px solid ${sponsor.accent}`, borderRadius: 10, padding: 22, marginBottom: 18 }}>
          {sponsor.body && (
            <p style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: '#f8fafc', lineHeight: 1.6, margin: '0 0 16px' }}>
              {sponsor.body}
            </p>
          )}
          {hasLeadForm ? (
            <SponsorLeadForm sponsor={sponsor} onSubmit={onLeadSubmit} disabled={previewOnly} />
          ) : (
            <a
              href={previewOnly ? undefined : sponsor.ctaUrl}
              target="_blank"
              rel="noopener"
              onClick={previewOnly ? (e) => e.preventDefault() : undefined}
              style={{ display: 'inline-block', padding: '11px 18px', background: sponsor.accent, borderRadius: 7, color: '#fff', textDecoration: 'none', fontFamily: 'system-ui', fontSize: 13, fontWeight: 700, cursor: previewOnly ? 'default' : 'pointer' }}
            >
              {sponsor.cta}
            </a>
          )}
        </div>
        {!previewOnly && (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '16px 18px' }}>
            <h3 style={{ fontFamily: 'system-ui', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b', margin: '0 0 8px' }}>
              Sponsor CTA Landing Area
            </h3>
            <p style={{ fontFamily: 'system-ui', fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0 }}>
              This is the middle-section sponsor result area. Each sponsor can use it as a pseudo landing page for a
              message, offer, form link, coupon, lead-generation CTA, or managed ARMS Reach campaign.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

// The black footer bar row — the actual "hook" a visitor sees before clicking WHOzTHEY?
export function SponsorFooterBar({ sponsor, onOpen }) {
  if (!sponsor) return null
  return (
    <div style={{ width: '100%', background: '#1e293b', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', boxSizing: 'border-box', borderRadius: 8 }}>
      <button onClick={onOpen} style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
        <p style={{ fontFamily: "'Georgia',serif", fontSize: 14, fontWeight: 700, color: '#f8fafc', margin: 0, lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {renderSponsorTeaser(sponsor.teaser)}…
        </p>
      </button>
      <button
        onClick={onOpen}
        aria-label="Open this WHOzTHEY result"
        style={{
          flexShrink: 0,
          padding: '7px 9px',
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          border: '1px solid #334155',
          borderRadius: 9,
          cursor: 'pointer',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -2px 3px rgba(0,0,0,0.4), 0 2px 0 rgba(0,0,0,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img src="/logo.png" alt="WHOzTHEY?" style={{ height: 36, width: 'auto', display: 'block' }} />
      </button>
    </div>
  )
}
