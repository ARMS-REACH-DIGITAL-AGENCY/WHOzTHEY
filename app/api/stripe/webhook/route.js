import { getSql } from '../../../../lib/db'
import { getStripe } from '../../../../lib/stripeClient'

export const dynamic = 'force-dynamic'

async function ensureStripeEventsIndex(sql) {
  await sql`create unique index if not exists stripe_events_event_id_idx on stripe_events (stripe_event_id)`
}

export async function POST(request) {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('Stripe webhook error: missing STRIPE_WEBHOOK_SECRET')
    return Response.json({ ok: false, error: 'Webhook not configured' }, { status: 500 })
  }

  const signature = request.headers.get('stripe-signature')
  const rawBody = await request.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error.message)
    return Response.json({ ok: false, error: 'Invalid signature' }, { status: 400 })
  }

  const sql = getSql()
  await ensureStripeEventsIndex(sql)

  const [stored] = await sql`
    insert into stripe_events (stripe_event_id, event_type, payload, processed)
    values (${event.id}, ${event.type}, ${JSON.stringify(event)}::jsonb, false)
    on conflict (stripe_event_id) do nothing
    returning id
  `

  if (!stored) {
    return Response.json({ ok: true, deduped: true })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const { sponsorId, sponsorCardId } = session.metadata || {}

      if (sponsorId) {
        await sql`
          update sponsors
          set status = 'active',
              stripe_customer_id = ${session.customer},
              stripe_subscription_id = ${session.subscription},
              updated_at = now()
          where id = ${sponsorId}
        `
      }
      if (sponsorCardId) {
        await sql`
          update sponsor_cards
          set is_active = true, starts_at = now(), updated_at = now()
          where id = ${sponsorCardId}
        `
      }
    }

    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object
      const isActive = subscription.status === 'active' || subscription.status === 'trialing'

      await sql`
        update sponsors
        set status = ${isActive ? 'active' : 'canceled'}, updated_at = now()
        where stripe_subscription_id = ${subscription.id}
      `

      if (!isActive) {
        await sql`
          update sponsor_cards
          set is_active = false, ends_at = now(), updated_at = now()
          where sponsor_id in (select id from sponsors where stripe_subscription_id = ${subscription.id})
        `
      }
    }

    await sql`update stripe_events set processed = true where stripe_event_id = ${event.id}`

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Stripe webhook handling error:', error)
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }
}
