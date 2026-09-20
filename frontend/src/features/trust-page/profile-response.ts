import type { CertificationStatus, PublicCertification, PublicSupplierHeader } from './types'

/**
 * Response of GET /api/public/compliance-profile/:organisationId, as agreed in
 * Field Mapping and Read API Contract v1.0, section 6.2. Snake_case, exactly as
 * it leaves the server: this is Team A's contract, S2-3's own props are in ./types.
 *
 * `value` and `provenance` stay opaque until Team A closes G-1 and G-2.
 */
export type ProfileCertificationStatus = 'verified' | 'self_declared' | 'expired'

export interface ProfileCertification {
  name: string
  issuer: string | null
  certificate_number: string | null
  scope: string | null
  valid_from: string | null
  valid_to: string | null
  /** Derived server-side (G-9). Never recompute it from the dates. */
  status: ProfileCertificationStatus
  /** Resolution pending G-3 (public download from a private bucket). */
  document_url: string | null
}

export interface ProfileAnswer {
  question_key: string
  prompt: string
  answer_type: string
  status: 'confirmed' | 'not_applicable'
  value: Record<string, unknown>
  /** `null` = the answer has no source; an object = it has one (shape pending G-2). */
  provenance: Record<string, unknown> | null
  confirmed_at: string
}

export interface ProfileCategory {
  key: string
  label: string
  answers: ProfileAnswer[]
}

export interface ProfileResponse {
  schema_version: string
  organisation: {
    id: string
    name: string
    abn: string | null
    country: string | null
    logo_url: string | null
    intro: string | null
  }
  last_updated: string
  certifications: ProfileCertification[]
  categories: ProfileCategory[]
}

// Written as a Record so a new status in the contract fails the type check here.
const certificationStatus: Record<ProfileCertificationStatus, CertificationStatus> = {
  verified: 'verified',
  self_declared: 'self-declared',
  expired: 'expired',
}

/** Temporary mapping until S2-2 assembles the display props from the API. */
export function toSupplierHeader(profile: ProfileResponse): PublicSupplierHeader {
  const { organisation } = profile
  return {
    name: organisation.name,
    logoUrl: organisation.logo_url,
    abn: organisation.abn,
    country: organisation.country,
    introduction: organisation.intro,
    lastUpdated: profile.last_updated,
  }
}

/**
 * `scope` has no line on the card yet (open question for design, C-4) and
 * `document_url` stays unused until G-3 is decided, so neither is passed on.
 */
export function toCertifications(profile: ProfileResponse): PublicCertification[] {
  return profile.certifications.map((certification, index) => ({
    // The contract carries no certification id; position is stable within one response.
    id: `certification-${index}`,
    name: certification.name,
    issuer: certification.issuer,
    certificateNumber: certification.certificate_number,
    validFrom: certification.valid_from,
    validUntil: certification.valid_to,
    status: certificationStatus[certification.status],
  }))
}
