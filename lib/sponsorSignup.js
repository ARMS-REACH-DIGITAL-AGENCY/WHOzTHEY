import crypto from 'crypto'
import { getSql } from './db'

// Extends the sponsors/sponsor_cards tables (created by /api/sponsor-cards)
// with the columns the self-serve checkout flow needs.
export async function ensureSponsorSignupSchema(sql) {
  await sql`alter table sponsors add column if not exists tier text`
  await sql`alter table sponsors add column if not exists dashboard_token text`
  await sql`create unique index if not exists sponsors_dashboard_token_idx on sponsors (dashboard_token) where dashboard_token is not null`
}

export function generateDashboardToken() {
  return crypto.randomBytes(24).toString('hex')
}

export async function findSponsorByDashboardToken(token) {
  const sql = getSql()
  await ensureSponsorSignupSchema(sql)
  const rows = await sql`select * from sponsors where dashboard_token = ${token} limit 1`
  return rows[0] || null
}
