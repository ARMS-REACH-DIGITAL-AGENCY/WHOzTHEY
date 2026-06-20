import crypto from 'crypto'
import { getSql } from './db'
import { ensureSponsorTables } from './sponsorSchema'

// Kept as a re-export so existing imports of ensureSponsorSignupSchema don't break.
export { ensureSponsorTables as ensureSponsorSignupSchema }

export function generateDashboardToken() {
  return crypto.randomBytes(24).toString('hex')
}

export async function findSponsorByDashboardToken(token) {
  const sql = getSql()
  await ensureSponsorTables(sql)
  const rows = await sql`select * from sponsors where dashboard_token = ${token} limit 1`
  return rows[0] || null
}
