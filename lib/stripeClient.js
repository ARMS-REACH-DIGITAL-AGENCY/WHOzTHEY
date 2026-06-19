import Stripe from 'stripe'

let stripeClient = null

export function getStripe() {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable.')
    }
    stripeClient = new Stripe(secretKey)
  }
  return stripeClient
}
