'use client'

import { useEffect } from 'react'

function injectStyles() {
  if (document.getElementById('whozthey-ux-tweaks-style')) return

  const style = document.createElement('style')
  style.id = 'whozthey-ux-tweaks-style'
  style.textContent = `
    #whozthey-shell footer[style*="sticky"] > div > div:first-child {
      padding: 2px 10px !important;
      min-height: 20px !important;
    }

    #whozthey-shell footer[style*="sticky"] > div > div:first-child button {
      font-size: 18px !important;
      padding: 0 6px !important;
      line-height: 1 !important;
    }

    #whozthey-shell footer[style*="sticky"] > div > div:first-child span {
      font-size: 9px !important;
      letter-spacing: 0.1em !important;
      line-height: 1 !important;
    }

    #whozthey-shell footer[style*="sticky"] > div > div:last-child {
      padding: 1px 8px 2px !important;
      min-height: 12px !important;
      line-height: 1 !important;
    }

    #whozthey-shell footer[style*="sticky"] > div > div:last-child span {
      font-size: 8px !important;
      line-height: 1 !important;
    }

    .whoz-fullscreen-slide-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 6;
      border: 1px solid rgba(255,255,255,0.35);
      border-radius: 999px;
      padding: 5px 9px;
      background: rgba(15,23,42,0.78);
      color: #fff;
      font-family: system-ui, sans-serif;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }

    .whoz-fullscreen-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(2,6,23,0.96);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 18px;
    }

    .whoz-fullscreen-close {
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 10001;
      border: 1px solid rgba(255,255,255,0.28);
      border-radius: 999px;
      padding: 8px 12px;
      background: rgba(15,23,42,0.92);
      color: #fff;
      font-family: system-ui, sans-serif;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
    }

    .whoz-fullscreen-stage {
      width: min(94vw, 980px);
      max-height: 86vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .whoz-fullscreen-stage > * {
      width: 100% !important;
      max-width: 980px !important;
      transform: none !important;
    }

    .whoz-fullscreen-stage img {
      width: 100% !important;
      height: auto !important;
      max-height: 86vh !important;
      object-fit: contain !important;
    }

    @media (orientation: portrait) and (max-width: 900px) {
      .whoz-fullscreen-stage {
        width: 86vh;
        max-width: none;
        transform: rotate(90deg);
      }

      .whoz-fullscreen-stage img {
        max-height: 88vw !important;
      }
    }
  `
  document.head.appendChild(style)
}

function findSlideCard() {
  const images = Array.from(document.querySelectorAll('#whozthey-shell img'))
    .filter((img) => {
      const rect = img.getBoundingClientRect()
      const src = img.getAttribute('src') || ''
      return rect.width > 260 && rect.height > 120 && !src.includes('logo')
    })

  if (!images.length) return null

  const image = images[0]
  return image.closest('section, article, div') || image
}

function openFullscreen(card) {
  const overlay = document.createElement('div')
  overlay.className = 'whoz-fullscreen-overlay'

  const close = document.createElement('button')
  close.className = 'whoz-fullscreen-close'
  close.type = 'button'
  close.textContent = 'Close'

  const stage = document.createElement('div')
  stage.className = 'whoz-fullscreen-stage'

  const clone = card.cloneNode(true)
  clone.querySelectorAll('.whoz-fullscreen-slide-btn').forEach((node) => node.remove())
  clone.querySelectorAll('button').forEach((button) => {
    if (button.textContent?.toLowerCase().includes('full')) button.remove()
  })

  stage.appendChild(clone)
  overlay.appendChild(close)
  overlay.appendChild(stage)
  document.body.appendChild(overlay)
  document.body.classList.add('whoz-fullscreen-open')

  const cleanup = () => {
    document.body.classList.remove('whoz-fullscreen-open')
    overlay.remove()
  }

  close.addEventListener('click', cleanup)
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) cleanup()
  })

  document.addEventListener('keydown', function onKeydown(event) {
    if (event.key === 'Escape') {
      document.removeEventListener('keydown', onKeydown)
      cleanup()
    }
  })

  overlay.requestFullscreen?.().catch(() => {})
}

function attachFullscreenButton() {
  const card = findSlideCard()
  if (!card || card.querySelector('.whoz-fullscreen-slide-btn')) return

  const currentPosition = window.getComputedStyle(card).position
  if (currentPosition === 'static') card.style.position = 'relative'

  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'whoz-fullscreen-slide-btn'
  button.textContent = 'Full Screen'
  button.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    openFullscreen(card)
  })

  card.appendChild(button)
}

export default function WhozTheyUxTweaks() {
  useEffect(() => {
    injectStyles()
    attachFullscreenButton()

    const observer = new MutationObserver(() => attachFullscreenButton())
    observer.observe(document.body, { childList: true, subtree: true })

    const interval = window.setInterval(attachFullscreenButton, 1500)

    return () => {
      observer.disconnect()
      window.clearInterval(interval)
    }
  }, [])

  return null
}
