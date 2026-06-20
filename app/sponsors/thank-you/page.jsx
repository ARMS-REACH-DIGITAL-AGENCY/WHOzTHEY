'use client'

import { useEffect, useState } from 'react'

const NEW_HOOK_DEFAULT = { claimText: '', revealBody: '', ctaUrl: '', ctaLabel: '' }

export default function SponsorThankYouPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [token, setToken] = useState(null)
  const [newHook, setNewHook] = useState(NEW_HOOK_DEFAULT)
  const [addingHook, setAddingHook] = useState(false)
  const [addHookError, setAddHookError] = useState(null)
  const [addHookSuccess, setAddHookSuccess] = useState(false)

  function loadStats(t) {
    return fetch(`/api/sponsors/stats?token=${t}`)
      .then((res) => res.json())
      .then((result) => {
        if (!result.ok) throw new Error(result.error || 'Could not load your dashboard yet.')
        setData(result)
      })
      .catch((err) => setError(err.message))
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token')
    setToken(t)
    if (!t) return
    loadStats(t)
  }, [])

  async function handleAddHook(e) {
    e.preventDefault()
    setAddingHook(true)
    setAddHookError(null)
    try {
      const res = await fetch('/api/sponsors/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...newHook }),
      })
      const result = await res.json()
      if (!result.ok) throw new Error(result.error || 'Could not add that hook.')
      setNewHook(NEW_HOOK_DEFAULT)
      setAddHookSuccess(true)
      await loadStats(token)
    } catch (err) {
      setAddHookError(err.message)
    } finally {
      setAddingHook(false)
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '60px 20px', fontFamily: 'inherit', textAlign: 'center' }}>
      <h1>You're in! 🎉</h1>
      <p style={{ fontSize: 16, color: '#555' }}>
        Your subscription is processing. It can take a few seconds for your hook to go live. Bookmark this page —
        it's your permanent results dashboard.
      </p>

      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {data && (
        <div style={{ marginTop: 32, border: '1px solid #ddd', borderRadius: 12, padding: 24, textAlign: 'left' }}>
          <h2 style={{ marginTop: 0 }}>{data.sponsor.sponsorName}</h2>
          <p style={{ color: '#666', fontSize: 14 }}>
            Status: <strong>{data.sponsor.status}</strong> · Tier: <strong>{data.sponsor.tier}</strong>
          </p>
          <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{data.stats.impressions}</div>
              <div style={{ fontSize: 13, color: '#888' }}>Impressions</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{data.stats.clicks}</div>
              <div style={{ fontSize: 13, color: '#888' }}>Clicks</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{data.stats.clickThroughRate}%</div>
              <div style={{ fontSize: 13, color: '#888' }}>Click-through rate</div>
            </div>
          </div>
        </div>
      )}

      {data && data.cards?.length > 0 && (
        <div style={{ marginTop: 24, border: '1px solid #ddd', borderRadius: 12, padding: 24, textAlign: 'left' }}>
          <h3 style={{ marginTop: 0 }}>Your hooks</h3>
          {data.cards.map((card) => (
            <div key={card.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontSize: 14 }}>
              <strong>{card.is_active ? '🟢' : '⚪'}</strong> {card.teaser}
            </div>
          ))}
        </div>
      )}

      {data && data.sponsor.status === 'active' && (
        <div style={{ marginTop: 24, border: '1px solid #ddd', borderRadius: 12, padding: 24, textAlign: 'left' }}>
          <h3 style={{ marginTop: 0 }}>Add another hook</h3>
          <p style={{ fontSize: 13, color: '#666', margin: '0 0 12px' }}>
            Point a new "They say..." hook at the same or a different offer — no second checkout needed.
          </p>
          <form onSubmit={handleAddHook} style={{ display: 'grid', gap: 10 }}>
            <textarea
              required
              rows={2}
              placeholder='They say...'
              value={newHook.claimText}
              onChange={(e) => setNewHook((p) => ({ ...p, claimText: e.target.value }))}
              style={hookInputStyle}
            />
            <textarea
              rows={2}
              placeholder="Reveal pitch (optional)"
              value={newHook.revealBody}
              onChange={(e) => setNewHook((p) => ({ ...p, revealBody: e.target.value }))}
              style={hookInputStyle}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input
                type="url"
                placeholder="Destination URL"
                value={newHook.ctaUrl}
                onChange={(e) => setNewHook((p) => ({ ...p, ctaUrl: e.target.value }))}
                style={hookInputStyle}
              />
              <input
                placeholder="Button label"
                value={newHook.ctaLabel}
                onChange={(e) => setNewHook((p) => ({ ...p, ctaLabel: e.target.value }))}
                style={hookInputStyle}
              />
            </div>
            {addHookError && <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>{addHookError}</p>}
            {addHookSuccess && <p style={{ color: '#16a34a', fontSize: 13, margin: 0 }}>Hook added and live.</p>}
            <button
              type="submit"
              disabled={addingHook}
              style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 14, fontWeight: 700, cursor: addingHook ? 'default' : 'pointer' }}
            >
              {addingHook ? 'Adding…' : 'Add hook'}
            </button>
          </form>
        </div>
      )}

      {token && (
        <p style={{ marginTop: 24, fontSize: 13, color: '#999' }}>
          Your dashboard link: <code>{`whozthey.com/sponsors/thank-you?token=${token}`}</code>
        </p>
      )}
    </main>
  )
}

const hookInputStyle = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #ccc',
  fontSize: 14,
  fontFamily: 'inherit',
  resize: 'vertical',
}
