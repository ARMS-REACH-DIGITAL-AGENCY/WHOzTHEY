import { Inter, Anton } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton' })

export const metadata = {
  metadataBase: new URL('https://whozthey.com'),
  title: 'WHOzTHEY? — Tracing the Origin of Everything "They" Ever Said',
  description: 'You\'ve heard it. Now find out where it really came from. WHOzTHEY? researches the true origin of folk sayings, old wives\' tales, and "They say..." claims.',
  keywords: 'they say, folk sayings, myth busting, old wives tales, fact check, origin of sayings, who said it',
  openGraph: {
    title: 'WHOzTHEY?',
    description: 'Tracing the origin of everything "They" ever said.',
    url: 'https://whozthey.com',
    siteName: 'WHOzTHEY?',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WHOzTHEY?',
    description: 'Tracing the origin of everything "They" ever said.',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${anton.variable}`} style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
