import type { PublicSupplierHeader } from './types'
import { DisplayDate, isDisplayDate } from './DisplayDate'
import styles from './trust-page.module.css'

// Placeholder tile shown when a supplier has no logo, as in the design's
// "logo-placeholder" (initials on the brand colour). Decorative: the name is
// rendered as the heading right beside it.
function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? '')
    .join('')
    .toUpperCase()
}

export function SupplierHeader({ supplier }: { supplier: PublicSupplierHeader }) {
  const logoUrl = supplier.logoUrl?.trim()
  const abn = supplier.abn?.trim()
  const country = supplier.country?.trim()
  const introduction = supplier.introduction?.trim()
  const placeholder = initials(supplier.name)

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        {logoUrl ? (
          <div className={styles.logo}>
            {/* Supplier assets are served directly; no server-side image fetch or new remote allowlist. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.logoImage}
              src={logoUrl}
              alt={`${supplier.name} logo`}
              width={64}
              height={64}
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          placeholder && (
            <div className={styles.logo} aria-hidden="true">
              {placeholder}
            </div>
          )
        )}
        <div className={styles.titleDetails}>
          <h1 className={styles.name}>{supplier.name}</h1>
          {isDisplayDate(supplier.lastUpdated) && (
            <p className={styles.meta}>
              Last updated: <DisplayDate value={supplier.lastUpdated} />
            </p>
          )}
        </div>
      </div>
      {(abn || country || introduction) && (
        <div className={styles.bottom}>
          {(abn || country) && (
            <dl className={styles.facts}>
              {abn && (
                <div className={styles.fact}>
                  <dt>ABN</dt>
                  <dd>{abn}</dd>
                </div>
              )}
              {country && (
                <div className={styles.fact}>
                  <dt>Country</dt>
                  <dd>{country}</dd>
                </div>
              )}
            </dl>
          )}
          {introduction && <p className={styles.introduction}>{introduction}</p>}
        </div>
      )}
    </header>
  )
}
