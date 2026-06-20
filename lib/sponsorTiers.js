// Self-serve sponsorship tiers. Stripe price IDs are pinned to the live
// Founding Sponsor products created at launch — update here if pricing changes.
export const SPONSOR_TIERS = {
  starter: {
    key: 'starter',
    name: 'Starter Hook',
    priceId: 'price_1TkBY0FIG05kj2LuwN2E3GKs',
    monthlyPrice: 29,
    standardPrice: 59,
    goal: 'Traffic / Clicks',
    funnelModes: 'External Redirect or Framed Funnel',
    description: 'Your own "They say..." hook in the footer carousel, linking straight to your site or offer page.',
    defaultLinkMode: 'direct',
  },
  reveal: {
    key: 'reveal',
    name: 'Reveal & Convert',
    priceId: 'price_1TkBY1FIG05kj2LuUWg2k33m',
    monthlyPrice: 79,
    standardPrice: 149,
    goal: 'Offer / Coupon Claims',
    funnelModes: 'Native Reveal + CTA',
    description: 'A native in-app reveal panel built around your hook, with a coupon or offer claim button we host for you.',
    defaultLinkMode: 'panel',
  },
  leads: {
    key: 'leads',
    name: 'Lead Engine',
    priceId: 'price_1TkBY2FIG05kj2LuTIo7bpUy',
    monthlyPrice: 199,
    standardPrice: 349,
    goal: 'Qualified Leads',
    funnelModes: 'Native Lead Form or Quiz/Mystery',
    description: 'A native lead-capture form or mini-quiz embedded in your hook, with leads delivered straight to you.',
    defaultLinkMode: 'panel',
    leadCapture: true,
  },
}

export function getSponsorTier(tierKey) {
  return SPONSOR_TIERS[tierKey] || null
}
