import type { Metadata } from 'next'
import { SupplierHeader } from '@/features/trust-page/SupplierHeader'
import { CertificationCards } from '@/features/trust-page/CertificationCards'
import type { PublicCertification, PublicSupplierHeader } from '@/features/trust-page/types'
import styles from './preview.module.css'

export const metadata: Metadata = {
  title: { absolute: 'S2-3 QA preview | Team B' },
  robots: { index: false, follow: false },
}

const supplier: PublicSupplierHeader = {
  name: 'Greenleaf Packaging (demo)',
  logoUrl: '/trust-page/demo-leaf.svg',
  abn: '00 000 000 000 (sample only)',
  country: 'Australia',
  introduction:
    'A fictional supplier profile for reviewing the public header and certification cards. All details and certifications on this page are synthetic.',
  lastUpdated: '2026-09-18T09:00:00Z',
}

const certificates: [PublicCertification, PublicCertification, PublicCertification] = [
  {
    id: 'environment',
    name: 'ISO 14001',
    issuer: 'Example Certification Body',
    certificateNumber: 'DEMO-ENV-001',
    validFrom: '2026-01-01',
    validUntil: '2027-12-31',
    status: 'verified',
  },
  {
    id: 'packaging',
    name: 'Responsible packaging',
    issuer: 'Supplier declaration',
    status: 'self-declared',
  },
  {
    id: 'quality',
    name: 'ISO 9001',
    issuer: 'Example Certification Body',
    certificateNumber: 'DEMO-QMS-002',
    validFrom: '2023-09-01',
    validUntil: '2025-08-31',
    status: 'expired',
  },
]

const scenarios = ['full', 'thin', 'empty', 'long'] as const
type Scenario = (typeof scenarios)[number]

export default async function S23Preview({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string }>
}) {
  const query = await searchParams
  const scenario: Scenario = scenarios.find((item) => item === query.scenario) ?? 'full'
  const shownSupplier: PublicSupplierHeader =
    scenario === 'thin'
      ? { name: 'Greenleaf (thin demo)', country: 'Australia' }
      : scenario === 'long'
        ? {
            ...supplier,
            name: 'Greenleaf International Sustainable Packaging and Materials Cooperative (demo)',
          }
        : supplier
  const shownCertificates =
    scenario === 'empty'
      ? []
      : scenario === 'thin'
        ? [{ id: 'minimal', name: 'Supplier certification', status: 'self-declared' as const }]
        : scenario === 'long'
          ? [
              {
                ...certificates[0],
                certificateNumber: 'LONG-REFERENCE-'.repeat(12),
                issuer:
                  'Example International Environmental Certification and Quality Assurance Organisation',
              },
              ...certificates.slice(1),
            ]
          : certificates

  return (
    <main className={styles.preview}>
      <div className={styles.notice}>
        <strong>S2-3 · QA preview</strong>
        <p>
          Synthetic data only. Not a live supplier page. Styled to the HighFidelity Figma frame
          “Profile 1 - Four Certifications - Desktop”; design QA is Callum’s.
        </p>
      </div>
      <nav className={styles.scenarios} aria-label="QA scenarios">
        {scenarios.map((item) => (
          <a
            key={item}
            href={`?scenario=${item}`}
            aria-current={item === scenario ? 'page' : undefined}
          >
            {item === 'full'
              ? 'All statuses'
              : item === 'thin'
                ? 'Missing fields'
                : item === 'empty'
                  ? 'No certifications'
                  : 'Long content'}
          </a>
        ))}
      </nav>
      <SupplierHeader supplier={shownSupplier} />
      <CertificationCards certifications={shownCertificates} />
      <footer className={styles.footer}>
        Team B · Header & certification cards · Downloads hidden pending G-3
      </footer>
    </main>
  )
}
