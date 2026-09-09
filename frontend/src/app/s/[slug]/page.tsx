import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'

type Props = { params: Promise<{ slug: string }> }

// Synthetic fixtures only. The final identifier/API contract still needs sign-off.
const demoIdentifiers = new Set(['demo-supplier', '11111111-1111-4111-8111-111111111111'])

async function requireDemo(params: Props['params']) {
  const { slug } = await params
  if (!demoIdentifiers.has(slug)) notFound()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await requireDemo(params)
  return {
    title: { absolute: 'Demo Supplier | Team B SSR spike' },
    description: 'Synthetic public Trust Page demonstrating server-rendered HTML and metadata.',
    robots: { index: false, follow: false },
    openGraph: {
      title: 'Demo Supplier | Team B SSR spike',
      description: 'Synthetic public Trust Page demonstrating server-rendered HTML and metadata.',
      type: 'website',
    },
  }
}

export default async function TrustPageSpike({ params }: Props) {
  await requireDemo(params)
  await connection()
  const renderedAt = new Date().toISOString()

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 text-slate-900">
      <p className="mb-4 font-semibold text-blue-700">TEAM B / SSR SPIKE / SYNTHETIC DATA</p>
      <h1 className="mb-4 text-4xl font-bold">Demo Supplier</h1>
      <p className="mb-8 text-lg">
        A public Trust Page rendered on the server, without signing in.
      </p>
      <section
        aria-labelledby="certifications"
        className="mb-8 rounded-lg border border-slate-300 p-6"
      >
        <h2 id="certifications" className="mb-3 text-2xl font-semibold">
          Certifications
        </h2>
        <p>No certifications published.</p>
      </section>
      <section aria-labelledby="scope" className="mb-8">
        <h2 id="scope" className="mb-3 text-2xl font-semibold">
          What this demo proves
        </h2>
        <p>
          The HTTP response contains visible content, a title, description and Open Graph tags. No
          real supplier data or database credentials are used by this route.
        </p>
        <p className="mt-3">
          Live API integration, exports, publication controls and the final slug/UUID decision are
          outside this spike.
        </p>
      </section>
      <p className="text-sm text-slate-600">
        Server render time:{' '}
        <time data-ssr-rendered-at={renderedAt} dateTime={renderedAt}>
          {renderedAt}
        </time>
      </p>
    </main>
  )
}
