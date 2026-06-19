'use client'

import { useEffect, useState } from 'react'

export default function SponsorThankYouPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token')
    setToken(t)
    if (!t) return

    fetch(`/api/sponsors/stats?token=${t}`)
      .then((res) => res.json())
      .then((result) => {
        if (!result.ok) throw new Error(result.error || 'Could not load your dashboard yet.')
        setData(result)
      })
      .catch((err) => setError(err.message))
  }, [])

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

      {token && (
        <p style={{ marginTop: 24, fontSize: 13, color: '#999' }}>
          Your dashboard link: <code>{`whozthey.com/sponsors/thank-you?token=${token}`}</code>
        </p>
      )}
    </main>
  )
}
