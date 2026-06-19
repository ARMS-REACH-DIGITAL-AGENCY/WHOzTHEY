'use client'

// This is the main entry point.
// The full app component is in components/WHOzTHEY.jsx
// API calls now go through /api/search and /api/clarify (server-side)
// so the Anthropic API key is NEVER exposed to the browser.

import WHOzTHEY from '../components/WHOzTHEY'
import WhozTheyUxTweaks from '../components/WhozTheyUxTweaks'

export default function Home() {
  return (
    <div id="whozthey-shell">
      <WHOzTHEY />
      <WhozTheyUxTweaks />
    </div>
  )
}
