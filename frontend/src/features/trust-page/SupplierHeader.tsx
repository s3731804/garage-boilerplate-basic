import type { PublicSupplierHeader } from './types'
import { DisplayDate, isDisplayDate } from './DisplayDate'
import styles from './trust-page.module.css'

export function SupplierHeader({ supplier }: { supplier: PublicSupplierHeader }) {
  return (
    <header className={styles.header}>
      <div className={styles.identity}>
        {supplier.logoUrl?.trim() && (
          // Supplier assets are served directly; no server-side image fetch or new remote allowlist.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.logo}
            src={supplier.logoUrl}
            alt={`${supplier.name} logo`}
            width={80}
            height={80}
            referrerPolicy="no-referrer"
          />
        )}
        <div>
          <p className={styles.eyebrow}>Supplier profile</p>
          <h1 className={styles.name}>{supplier.name}</h1>
        </div>
      </div>
      <dl className={styles.facts}>
        {supplier.abn?.trim() && (
          <div>
            <dt>ABN</dt>
            <dd>{supplier.abn}</dd>
          </div>
        )}
        {supplier.country?.trim() && (
          <div>
            <dt>Country</dt>
            <dd>{supplier.country}</dd>
          </div>
        )}
        {isDisplayDate(supplier.lastUpdated) && (
          <div>
            <dt>Last updated</dt>
            <dd>
              <DisplayDate value={supplier.lastUpdated} />
            </dd>
          </div>
        )}
      </dl>
      {supplier.introduction?.trim() && (
        <p className={styles.introduction}>{supplier.introduction}</p>
      )}
    </header>
  )
}
