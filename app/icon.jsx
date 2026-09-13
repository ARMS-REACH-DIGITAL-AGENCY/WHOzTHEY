import { ImageResponse } from 'next/og'
import fs from 'node:fs'
import path from 'node:path'

export const runtime = 'nodejs'
export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default async function Icon() {
  const logoPath = path.join(process.cwd(), 'public', 'logo.png')
  const logoSrc = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          borderRadius: '64px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={420} height={260} alt="WHOzTHEY?" />
      </div>
    ),
    { ...size }
  )
}
