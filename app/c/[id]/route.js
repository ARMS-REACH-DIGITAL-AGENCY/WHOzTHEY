import { getSql, UUID_RE } from '../../../lib/db'

const SHORT_CODE_RE = /^[A-Za-z0-9]{4,32}$/

export async function GET(request, { params }) {
  const origin = new URL(request.url).origin
  const code = params.id

  if (!code || (!UUID_RE.test(code) && !SHORT_CODE_RE.test(code))) {
    return Response.redirect(origin, 302)
  }

  try {
    const sql = getSql()
    // Short codes are the current scheme; the uuid branch keeps already-shared
    // /c/<claims.id> links (from before short_code existed) working.
    const rows = UUID_RE.test(code)
      ? await sql`select display_claim from claims where id = ${code} limit 1`
      : await sql`select display_claim from claims where short_code = ${code} limit 1`
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
