import { useId } from 'react'
import type { PublicCertification } from './types'
import { DisplayDate, isDisplayDate } from './DisplayDate'
import styles from './trust-page.module.css'

const statusLabels = {
  verified: 'Verified',
  'self-declared': 'Self-declared',
  expired: 'Expired',
}

function CertificationCard({ certification: cert }: { certification: PublicCertification }) {
  const headingId = useId()
  return (
    <article className={styles.card} aria-labelledby={headingId}>
      <div className={styles.cardHeading}>
        <h3 id={headingId}>{cert.name}</h3>
        <span className={`${styles.chip} ${styles[cert.status]}`}>{statusLabels[cert.status]}</span>
      </div>
      <dl className={styles.details}>
        {cert.issuer?.trim() && (
          <div>
            <dt>Issuer</dt>
            <dd>{cert.issuer}</dd>
          </div>
        )}
        {cert.certificateNumber?.trim() && (
          <div>
            <dt>Certificate number</dt>
            <dd>{cert.certificateNumber}</dd>
          </div>
        )}
        {isDisplayDate(cert.validFrom) && (
          <div>
            <dt>Valid from</dt>
            <dd>
              <DisplayDate value={cert.validFrom} />
            </dd>
          </div>
        )}
        {isDisplayDate(cert.validUntil) && (
          <div className={cert.status === 'expired' ? styles.expiredDate : undefined}>
            <dt>{cert.status === 'expired' ? 'Expired on' : 'Valid until'}</dt>
            <dd>
              <DisplayDate value={cert.validUntil} />
            </dd>
          </div>
        )}
      </dl>
    </article>
  )
}

export function CertificationCards({
  certifications,
}: {
  certifications: readonly PublicCertification[]
}) {
  const headingId = useId()
  return (
    <section className={styles.certifications} aria-labelledby={headingId}>
      <div className={styles.sectionHeading}>
        <h2 id={headingId}>Certifications</h2>
        <span>{certifications.length} published</span>
      </div>
      {certifications.length === 0 && <p className={styles.empty}>No certifications published</p>}
      <div className={styles.grid}>
        {certifications.map((certification) => (
          <CertificationCard key={certification.id} certification={certification} />
        ))}
      </div>
    </section>
  )
}
