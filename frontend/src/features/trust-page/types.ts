/** S2-3 display contract, not Team A's database schema.
 * Only pass public, server-assembled data. S2-2 owns status and visibility rules.
 */
export interface PublicSupplierHeader {
  name: string
  logoUrl?: string | null
  abn?: string | null
  country?: string | null
  introduction?: string | null
  lastUpdated?: string | null
}

export type CertificationStatus = 'verified' | 'self-declared' | 'expired'

export interface PublicCertification {
  id: string
  name: string
  issuer?: string | null
  certificateNumber?: string | null
  validFrom?: string | null
  validUntil?: string | null
  status: CertificationStatus
}
