'use client'

import { useEffect, useMemo, useState } from 'react'

const SEED_FACTS = [
  'You lose most of your body heat through your head',
  'Reading in dim light ruins your eyesight',
  'Lightning never strikes the same place twice',
  'Cracking your knuckles causes arthritis',
  'You only use 10% of your brain',
  'Swimming right after eating causes cramps',
  'Carrots improve your eyesight',
  "A dog's mouth is cleaner than a human's",
  'You swallow 8 spiders a year in your sleep',
  'Feed a cold, starve a fever',
  'Hair and nails keep growing after death',
  'An apple a day keeps the doctor away',
  'Sitting too close to the TV damages your eyes',
  'Cold weather gives you a cold',
  'Goldfish have a 3-second memory',
  'Shaving makes hair grow back thicker',
  'Sugar makes kids hyperactive',
  'Bulls are enraged by the color red',
]

const FALLBACK_SPONSOR_CARDS = [
  {
    id: 'fallback-tpc',
    isSponsor: true,
    sponsor: 'Travel Protection Club',
    badge: 'SPONSORED',
    badgeColor: '#0284c7',
    teaser: 'They are giving golfers $75 ShipSticks Vouchers!',
    body: 'Travel Protection Club by Benefit Buddies helps golfers protect trips, shipments, and travel plans with real savings and added peace of mind.',
    cta: 'Claim Your Voucher',
    ctaUrl: 'https://whozthey.com',
    accent: '#0284c7',
  },
  {
    id: 'fallback-yatstats',
    isSponsor: true,
    sponsor: 'YatStats',
    badge: 'SPONSORED',
    badgeColor: '#16a34a',
    teaser: 'They are helping high school baseball teams raise money!',
    body: 'YAT?STATS turns alumni tracking, nostalgia, and local sports pride into a fundraising and fan-engagement platform for schools and booster programs.',
    cta: 'See Where They YAT?',
    ctaUrl: 'https://yatstats.com',
    accent: '#16a34a',
  },
]

function buildCarousel(sponsorCards) {
  const cards = sponsorCards.length ? sponsorCards : FALLBACK_SPONSOR_CARDS
  const items = []

  SEED_FACTS.forEach((fact, index) => {
    items.push({ id: `fun-${index}`, isSponsor: false, teaser: fact })

    if ((index + 1) % 3 === 0) {
      items.push(cards[Math.floor(index / 3) % cards.length])
    }
  })

  return items
}

function runWhozTheySearch(claim) {
  const input = document.querySelector('#whozthey-shell input[aria-label="Search a claim"]')

  if (!input) return false

  const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
  valueSetter?.call(input, claim)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }))
  window.scrollTo({ top: 0, behavior: 'smooth' })

  return true
}

export default function SponsorFooterBridge() {
  const [sponsorCards, setSponsorCards] = useState([])
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [selectedSponsor, setSelectedSponsor] = useState(null)

  useEffect(() => {
    let alive = true

    fetch('/api/sponsor-cards', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { sponsorCards: [] }))
      .then((data) => {
        if (!alive) return
        setSponsorCards(Array.isArray(data.sponsorCards) ? data.sponsorCards : [])
      })
      .catch(() => {
        if (alive) setSponsorCards([])
      })

    return () => {
      alive = false
    }
  }, [])

  const items = useMemo(() => buildCarousel(sponsorCards), [sponsorCards])
  const item = items[current % items.length]

  useEffect(() => {
    if (paused || !items.length) return undefined
    const timer = setInterval(() => setCurrent((value) => (value + 1) % items.length), 10000)
    return () => clearInterval(timer)
  }, [items.length, paused])

  function move(delta) {
    setPaused(true)
    setCurrent((value) => (value + delta + items.length) % items.length)
    setTimeout(() => setPaused(false), 8000)
  }

  function openItem() {
    setPaused(true)
    setTimeout(() => setPaused(false), 8000)

    if (item.isSponsor) {
      setSelectedSponsor(item)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    runWhozTheySearch(item.teaser)
  }

  const footerText = item.isSponsor ? item.teaser : `They say ${item.teaser.toLowerCase()}...`

  return (
    <>
      {selectedSponsor && (
        <section style={{ position: 'fixed', top: 112, left: 0, right: 0, bottom: 88, zIndex: 55, overflow: 'auto', background: '#fff', borderTop: '3px solid #e2e8f0', boxShadow: '0 8px 24px rgba(15,23,42,0.18)' }}>
          <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '20px 24px' }}>
            <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <p style={{ fontFamily: 'system-ui', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: selectedSponsor.accent || '#dc2626', margin: '0 0 4px' }}>
                  SPONSORED - {selectedSponsor.sponsor}
                </p>
                <h2 style={{ fontFamily: "'Georgia',serif", fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>
                  <span style={{ color: '#dc2626' }}>They</span>{selectedSponsor.teaser?.startsWith('They') ? selectedSponsor.teaser.slice(4) : ` ${selectedSponsor.teaser}`}
                </h2>
              </div>
              <button onClick={() => setSelectedSponsor(null)} style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: 4, color: '#64748b', fontSize: 11, fontFamily: 'system-ui', padding: '3px 10px', cursor: 'pointer', flexShrink: 0 }}>
                Close x
              </button>
            </div>
          </div>

          <div style={{ maxWidth: 760, margin: '0 auto', padding: 24 }}>
            <div style={{ background: '#0f172a', borderLeft: `4px solid ${selectedSponsor.accent || '#dc2626'}`, borderRadius: 10, padding: 22, marginBottom: 18 }}>
              <p style={{ fontFamily: "'Georgia',serif", fontSize: 18, color: '#f8fafc', lineHeight: 1.6, margin: '0 0 16px' }}>
                {selectedSponsor.body}
              </p>
              <a href={selectedSponsor.ctaUrl || 'https://whozthey.com'} target="_blank" rel="noopener" style={{ display: 'inline-block', padding: '11px 18px', background: selectedSponsor.accent || '#dc2626', borderRadius: 7, color: '#fff', textDecoration: 'none', fontFamily: 'system-ui', fontSize: 13, fontWeight: 700 }}>
                {selectedSponsor.cta || 'Learn More'}
              </a>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '16px 18px' }}>
              <h3 style={{ fontFamily: 'system-ui', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b', margin: '0 0 8px' }}>
                Special Offer
              </h3>
              <p style={{ fontFamily: 'system-ui', fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0 }}>
                This is the first Neon-powered sponsor offer panel. Next, this can become a coupon, voucher, appointment, quote request, or opt-in template.
              </p>
            </div>
          </div>
        </section>
      )}

      <footer style={{ background: '#0f172a', position: 'sticky', bottom: 0, zIndex: 80, boxShadow: '0 -4px 16px rgba(0,0,0,0.5)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px' }}>
            <button onClick={() => move(-1)} aria-label="Previous footer item" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 22, padding: '0 8px', lineHeight: 1, fontWeight: 300 }}>‹</button>
            <span style={{ fontFamily: 'system-ui', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff' }}>
              {item.isSponsor ? '★ SPONSORED' : '★ FUN FACTS'}
            </span>
            <button onClick={() => move(1)} aria-label="Next footer item" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 22, padding: '0 8px', lineHeight: 1, fontWeight: 300 }}>›</button>
          </div>

          <div style={{ width: '100%', background: '#1e293b', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', boxSizing: 'border-box' }}>
            <button onClick={openItem} style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
              <p style={{ fontFamily: "'Georgia',serif", fontSize: 14, fontWeight: 700, color: '#f8fafc', margin: 0, lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {footerText.startsWith('They') ? <><span style={{ color: '#dc2626' }}>They</span>{footerText.slice(4)}</> : footerText}
              </p>
            </button>
            <button onClick={openItem} aria-label="Open this WHOzTHEY result" style={{ flexShrink: 0, padding: '7px 9px', background: '#0f172a', border: '1px solid #475569', borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logo.png" alt="WHOzTHEY?" style={{ height: 36, width: 'auto', display: 'block' }} />
            </button>
          </div>

          <div style={{ textAlign: 'center', padding: '5px 8px 6px' }}>
            <span style={{ fontFamily: 'system-ui', fontSize: 9, color: '#64748b', letterSpacing: '0.08em' }}>© 2026 ARMS REACH Digital Agency</span>
          </div>
        </div>
      </footer>
    </>
  )
}
