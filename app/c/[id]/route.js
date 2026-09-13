import { getSql } from '../../../lib/db'

export async function GET(request, { params }) {
  const origin = new URL(request.url).origin
  const id = Number(params.id)

  if (!Number.isInteger(id) || id <= 0) {
    return Response.redirect(origin, 302)
  }

  try {
    const sql = getSql()
    const rows = await sql`select display_claim from claims where id = ${id} limit 1`
    const claim = rows[0]?.display_claim

    if (!claim) {
      return Response.redirect(origin, 302)
    }

    const target = new URL('/', origin)
    target.searchParams.set('q', claim)
    return Response.redirect(target.toString(), 302)
  } catch (error) {
    console.error('Short link redirect error:', error)
    return Response.redirect(origin, 302)
  }
}
