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
  const issuer = cert.issuer?.trim()
  const certificateNumber = cert.certificateNumber?.trim()
  const validFrom = isDisplayDate(cert.validFrom) ? cert.validFrom : null
  const validUntil = isDisplayDate(cert.validUntil) ? cert.validUntil : null
  const expired = cert.status === 'expired'

  // Design: one bold line, "Valid: <from> - <until>"; with only one end it
  // reads "Valid from: …" / "Valid to: …". Expiry comes from the server-side
  // status, never from comparing dates in the browser.
  const validityLabel = validFrom && validUntil ? 'Valid' : validFrom ? 'Valid from' : 'Valid to'

  return (
    <article className={styles.card} aria-labelledby={headingId}>
      <div className={styles.cardHeading}>
        <h3 id={headingId}>{cert.name}</h3>
        <span className={`${styles.chip} ${styles[cert.status]}`}>{statusLabels[cert.status]}</span>
      </div>
      <dl className={styles.details}>
        {issuer && (
          <div className={styles.detail}>
            <dt>Issuer</dt>
            <dd>{issuer}</dd>
          </div>
        )}
        {certificateNumber && (
          <div className={styles.detail}>
            <dt>Cert No</dt>
            <dd>{certificateNumber}</dd>
          </div>
        )}
        {(validFrom || validUntil) && (
          <div className={`${styles.detail} ${styles.validity}`}>
            <dt>{validityLabel}</dt>
            <dd>
              {validFrom && <DisplayDate value={validFrom} />}
              {validFrom && validUntil && ' - '}
              {validUntil && (
                <span className={expired ? styles.expiredDate : undefined}>
                  <DisplayDate value={validUntil} />
                  {expired && <span className={styles.srOnly}> (expired)</span>}
                </span>
              )}
            </dd>
          </div>
        )}
      </dl>
    </article>
  )
}

export function CertificationCards({
  certifications,
  sectionNumber = '01',
}: {
  certifications: readonly PublicCertification[]
  /** Position of this section on the page ("01 Certifications"); the page owner sets it. */
  sectionNumber?: string
}) {
  const headingId = useId()
  return (
    <section className={styles.certifications} aria-labelledby={headingId}>
      <div className={styles.sectionHeading}>
        <span className={styles.badge} aria-hidden="true">
          {sectionNumber}
        </span>
        <h2 id={headingId}>Certifications</h2>
      </div>
      {certifications.length === 0 && <p className={styles.empty}>No certifications published</p>}
      {certifications.length > 0 && (
        <div className={styles.grid}>
          {certifications.map((certification) => (
            <CertificationCard key={certification.id} certification={certification} />
          ))}
        </div>
      )}
    </section>
  )
}
