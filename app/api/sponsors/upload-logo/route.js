import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']

export async function POST(request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return Response.json(
        { ok: false, error: 'Logo upload is not configured yet. Paste a logo URL instead for now.' },
        { status: 503 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')
    if (!file || typeof file === 'string') {
      return Response.json({ ok: false, error: 'No file provided.' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json({ ok: false, error: 'Please upload a PNG, JPG, WEBP, or SVG image.' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return Response.json({ ok: false, error: 'File is too large (5MB max).' }, { status: 400 })
    }

    const blob = await put(`sponsor-logos/${Date.now()}-${file.name}`, file, {
      access: 'public',
      contentType: file.type,
    })

    return Response.json({ ok: true, url: blob.url })
  } catch (error) {
    console.error('Sponsor logo upload error:', error)
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }
}
