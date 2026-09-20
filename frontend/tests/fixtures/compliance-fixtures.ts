/**
 * Placeholder profile data for the Trust Page, following Test Fixture
 * Specification v1.0 (Morgan Xiao, 20 Sep 2026).
 *
 * This is the fallback in section 3 of that spec: Team A's data shape (K-4) has
 * not landed, so the fixture is built as the Field Mapping section 6.2 response
 * instead of being seeded into tables. Nothing here reads a database.
 *
 * - Every date is an offset from the `now` passed in (D-3), never a literal.
 * - Same `now` in, same output out (D-6). There is no state to reset.
 * - Everything is fictional (D-5).
 * - `value` is `{}` on every answer because G-1 is open; `provenance` is `null`
 *   when the answer has no source and `{}` when it has one, because G-2 is open.
 * - This file plays the part of Team A's server (status derivation, the nightly
 *   staleness job, the publish filter) so the page can be built against it.
 *   The real rules live in S2-2; this only mirrors Requirements v1.3.
 *
 * Only erasable TypeScript syntax is used, so scripts/seed-compliance-fixtures.mjs
 * can load it with Node's built-in type stripping.
 */
import type {
  ProfileAnswer,
  ProfileCategory,
  ProfileCertification,
  ProfileResponse,
} from '../../src/features/trust-page/profile-response'

const DAY_MS = 86_400_000

/** Prefix on every fixture question key, so a loader can truncate by it (spec section 12). */
export const FIXTURE_PREFIX = 'fixture.'

export const SUPPLIER_IDS = {
  'SUP-1': '5f1c0a00-0000-4000-8000-000000000001',
  'SUP-2': '5f1c0a00-0000-4000-8000-000000000002',
  'SUP-3': '5f1c0a00-0000-4000-8000-000000000003',
} as const

/** Belongs to no supplier: must answer exactly like the disabled SUP-3 (EC-06). */
export const UNREGISTERED_ID = '5f1c0a00-0000-4000-8000-0000000000ff'

type SupplierKey = keyof typeof SUPPLIER_IDS
type Visibility = 'public' | 'on_request' | 'private'

interface CertificationRow {
  id: string
  standard: string
  staffVerified: boolean
  validFromDays: number
  validToDays: number
  issuer: string | null
  certificateNumber: string | null
  scope: string | null
  updatedDaysAgo: number
}

interface DocumentRow {
  id: string
  title: string
  visibility: Visibility
  uploadedDaysAgo: number
  /** The seed deletes it after the answers citing it are confirmed (EC-07). */
  deleted: boolean
}

type AnswerStatus = 'confirmed' | 'stale' | 'draft' | 'not_applicable'

interface AnswerRow {
  id: string
  supplier: SupplierKey
  category: string
  type: string
  status: AnswerStatus
  visibility: Visibility
  prompt: string
  /** null = no source. */
  source: { documentId?: string; url?: boolean; resolver?: boolean } | null
  /** An expired certificate this answer depends on (ANS-08). */
  dependsOnCertification?: string
  confirmedDaysAgo: number | null
}

const ISSUER = 'Example Certification Body (fictional)'

export const CERTIFICATION_ROWS: readonly CertificationRow[] = [
  {
    id: 'CERT-01',
    standard: 'ISO 14001',
    staffVerified: true,
    validFromDays: -540,
    validToDays: 550,
    issuer: ISSUER,
    certificateNumber: 'FX-14001-0001',
    scope: 'Environmental management of promotional product distribution (fictional)',
    updatedDaysAgo: 60,
  },
  {
    id: 'CERT-02',
    standard: 'ISO 9001',
    staffVerified: false,
    validFromDays: -300,
    validToDays: 400,
    issuer: ISSUER,
    certificateNumber: 'FX-9001-0002',
    scope: 'Quality management (fictional)',
    updatedDaysAgo: 45,
  },
  {
    // Sighted by staff AND past its end date: it must read Expired (Requirements 3.1).
    id: 'CERT-03',
    standard: 'AS/NZS 4801',
    staffVerified: true,
    validFromDays: -900,
    validToDays: -60,
    issuer: 'Example Safety Registrar (fictional)',
    certificateNumber: 'FX-4801-0003',
    scope: 'Occupational health and safety management (fictional)',
    updatedDaysAgo: 120,
  },
  {
    // Issuer, number and scope all absent: the lines must be omitted, not blank.
    id: 'CERT-04',
    standard: 'FSC Chain of Custody',
    staffVerified: true,
    validFromDays: -200,
    validToDays: 500,
    issuer: null,
    certificateNumber: null,
    scope: null,
    updatedDaysAgo: 35,
  },
  {
    // Ends in 20 days: inside the 60/30/7 warning band, still self-declared.
    id: 'CERT-05',
    standard: 'EcoVadis Bronze',
    staffVerified: false,
    validFromDays: -350,
    validToDays: 20,
    issuer: 'Example Ratings Body (fictional)',
    certificateNumber: 'FX-ECO-0005',
    scope: 'Corporate sustainability rating (fictional)',
    updatedDaysAgo: 40,
  },
  {
    id: 'CERT-06',
    standard: 'Sedex SMETA',
    staffVerified: true,
    validFromDays: -100,
    validToDays: 600,
    issuer: 'Example Audit Platform (fictional)',
    certificateNumber: 'FX-SMETA-0006',
    scope: 'Ethical trade audit (fictional)',
    updatedDaysAgo: 50,
  },
]

export const DOCUMENT_ROWS: readonly DocumentRow[] = [
  {
    id: 'DOC-01',
    title: 'Modern Slavery Statement FY2025',
    visibility: 'public',
    uploadedDaysAgo: 30,
    deleted: false,
  },
  {
    id: 'DOC-02',
    title: 'SMETA Audit Report 2026',
    visibility: 'on_request',
    uploadedDaysAgo: 4,
    deleted: false,
  },
  {
    id: 'DOC-03',
    title: 'Certificate of Currency - Public Liability',
    visibility: 'private',
    uploadedDaysAgo: 3,
    deleted: false,
  },
  {
    id: 'DOC-04',
    title: 'ISO 14001 Certificate',
    visibility: 'public',
    uploadedDaysAgo: 28,
    deleted: false,
  },
  {
    id: 'DOC-05',
    title: 'Supplier Code of Conduct',
    visibility: 'public',
    uploadedDaysAgo: 24,
    deleted: false,
  },
  // Public and uploaded 2 days ago, but deleted: it must not move last_updated.
  {
    id: 'DOC-06',
    title: 'Environmental Policy 2024',
    visibility: 'public',
    uploadedDaysAgo: 2,
    deleted: true,
  },
]

function answer(row: Omit<AnswerRow, 'supplier'>, supplier: SupplierKey = 'SUP-1'): AnswerRow {
  return { ...row, supplier }
}

export const ANSWER_ROWS: readonly AnswerRow[] = [
  answer({
    id: 'ANS-01',
    category: 'modern_slavery',
    type: 'boolean',
    status: 'confirmed',
    visibility: 'public',
    prompt: 'Does the organisation publish a modern slavery statement?',
    source: { documentId: 'DOC-01' },
    confirmedDaysAgo: 30,
  }),
  answer({
    id: 'ANS-02',
    category: 'modern_slavery',
    type: 'date',
    status: 'confirmed',
    visibility: 'public',
    prompt: 'Which reporting period does the statement cover?',
    source: { documentId: 'DOC-01' },
    confirmedDaysAgo: 30,
  }),
  answer({
    id: 'ANS-03',
    category: 'labour',
    type: 'single_select',
    status: 'confirmed',
    visibility: 'public',
    prompt: 'How often are labour practices reviewed?',
    source: null,
    confirmedDaysAgo: 25,
  }),
  answer({
    id: 'ANS-04',
    category: 'labour',
    type: 'multi_select',
    status: 'confirmed',
    visibility: 'public',
    prompt: 'Which labour standards does the organisation follow?',
    source: { url: true },
    confirmedDaysAgo: 22,
  }),
  answer({
    id: 'ANS-05',
    category: 'environment',
    type: 'number',
    status: 'confirmed',
    visibility: 'public',
    prompt: 'What is the organisation’s emissions reduction target?',
    source: { documentId: 'DOC-05' },
    confirmedDaysAgo: 20,
  }),
  answer({
    id: 'ANS-06',
    category: 'governance',
    type: 'long_text',
    status: 'confirmed',
    visibility: 'public',
    prompt: 'Describe how the organisation governs supplier conduct.',
    source: { documentId: 'DOC-05' },
    confirmedDaysAgo: 18,
  }),
  answer({
    id: 'ANS-07',
    category: 'company',
    type: 'boolean',
    status: 'not_applicable',
    visibility: 'public',
    prompt: 'Does the organisation operate offshore facilities?',
    source: null,
    confirmedDaysAgo: 16,
  }),
  // Confirmed 90 days ago on the strength of CERT-03, which has since expired.
  answer({
    id: 'ANS-08',
    category: 'environment',
    type: 'boolean',
    status: 'confirmed',
    visibility: 'public',
    prompt: 'Is there a certified safety management system?',
    source: null,
    dependsOnCertification: 'CERT-03',
    confirmedDaysAgo: 90,
  }),
  answer({
    id: 'ANS-09',
    category: 'environment',
    type: 'free_text',
    status: 'draft',
    visibility: 'public',
    prompt: 'Which waste streams are recycled?',
    source: { documentId: 'DOC-05' },
    confirmedDaysAgo: null,
  }),
  answer({
    id: 'ANS-10',
    category: 'governance',
    type: 'file',
    status: 'confirmed',
    visibility: 'on_request',
    prompt: 'Provide the most recent audit report.',
    source: { documentId: 'DOC-02' },
    confirmedDaysAgo: 14,
  }),
  // Confirmed yesterday: the newest change of all, and private, so it must not move last_updated.
  answer({
    id: 'ANS-11',
    category: 'governance',
    type: 'free_text',
    status: 'confirmed',
    visibility: 'private',
    prompt: 'Who is the internal contact for audits?',
    source: null,
    confirmedDaysAgo: 1,
  }),
  answer({
    id: 'ANS-12',
    category: 'product',
    type: 'free_text',
    status: 'confirmed',
    visibility: 'public',
    prompt: 'How are product claims checked?',
    source: null,
    confirmedDaysAgo: 12,
  }),
  answer({
    id: 'ANS-13',
    category: 'product',
    type: 'derived',
    status: 'confirmed',
    visibility: 'public',
    prompt: 'What is the country of origin of the main product line?',
    source: { resolver: true },
    confirmedDaysAgo: 10,
  }),
  answer({
    id: 'ANS-14',
    category: 'packaging',
    type: 'boolean',
    status: 'stale',
    visibility: 'public',
    prompt: 'Is packaging fully recyclable?',
    source: null,
    confirmedDaysAgo: 100,
  }),
  answer({
    id: 'ANS-15',
    category: 'packaging',
    type: 'free_text',
    status: 'confirmed',
    visibility: 'private',
    prompt: 'Who supplies the packaging?',
    source: null,
    confirmedDaysAgo: 60,
  }),
  // Cites DOC-06, which the seed deletes: the answer can no longer be evidenced (EC-07).
  answer({
    id: 'ANS-16',
    category: 'labour',
    type: 'free_text',
    status: 'confirmed',
    visibility: 'public',
    prompt: 'Which environmental policy applies to the workforce?',
    source: { documentId: 'DOC-06' },
    confirmedDaysAgo: 70,
  }),
  // Confirmed by someone who has since left: renders normally with its original date (EC-13).
  answer({
    id: 'ANS-17',
    category: 'company',
    type: 'boolean',
    status: 'confirmed',
    visibility: 'public',
    prompt: 'Is the organisation independently owned?',
    source: null,
    confirmedDaysAgo: 5,
  }),
  answer(
    {
      id: 'ANS-20',
      category: 'modern_slavery',
      type: 'boolean',
      status: 'confirmed',
      visibility: 'public',
      prompt: 'Does the organisation publish a modern slavery statement?',
      source: null,
      confirmedDaysAgo: 12,
    },
    'SUP-2'
  ),
  answer(
    {
      id: 'ANS-21',
      category: 'company',
      type: 'boolean',
      status: 'not_applicable',
      visibility: 'public',
      prompt: 'Does the organisation operate offshore facilities?',
      source: null,
      confirmedDaysAgo: 9,
    },
    'SUP-2'
  ),
]

/** Display order of categories on the page. */
const CATEGORIES: readonly { key: string; label: string }[] = [
  { key: 'modern_slavery', label: 'Modern Slavery' },
  { key: 'labour', label: 'Labour' },
  { key: 'environment', label: 'Environment' },
  { key: 'governance', label: 'Governance' },
  { key: 'company', label: 'Company' },
  { key: 'product', label: 'Product' },
  { key: 'packaging', label: 'Packaging' },
]

function at(now: Date, days: number): string {
  return new Date(now.getTime() + days * DAY_MS).toISOString()
}

function dateAt(now: Date, days: number): string {
  return at(now, days).slice(0, 10)
}

/** Stable key per fixture answer, e.g. `fixture.labour.ans_03`. */
export function answerKey(row: Pick<AnswerRow, 'id' | 'category'>): string {
  return `${FIXTURE_PREFIX}${row.category}.${row.id.toLowerCase().replace('-', '_')}`
}

/** Requirements 3.1: an end date in the past overrides verification. */
function certificationStatus(row: CertificationRow, now: Date): ProfileCertification['status'] {
  if (dateAt(now, row.validToDays) < dateAt(now, 0)) return 'expired'
  return row.staffVerified ? 'verified' : 'self_declared'
}

/**
 * What the nightly staleness job leaves behind (G-10): an answer whose evidence
 * expired, or whose source document is gone, is stale.
 */
export function resolvedAnswerStatus(row: AnswerRow, now: Date): AnswerStatus {
  if (row.status !== 'confirmed') return row.status
  const certification = CERTIFICATION_ROWS.find((item) => item.id === row.dependsOnCertification)
  if (certification && certificationStatus(certification, now) === 'expired') return 'stale'
  const document = DOCUMENT_ROWS.find((item) => item.id === row.source?.documentId)
  if (document?.deleted) return 'stale'
  return 'confirmed'
}

/** Requirements R-1: public, and confirmed or not applicable. */
function isPublished(row: AnswerRow, now: Date): boolean {
  const status = resolvedAnswerStatus(row, now)
  return row.visibility === 'public' && (status === 'confirmed' || status === 'not_applicable')
}

function toProfileAnswer(row: AnswerRow, now: Date): ProfileAnswer {
  const status = resolvedAnswerStatus(row, now)
  return {
    question_key: answerKey(row),
    prompt: row.prompt,
    answer_type: row.type,
    // isPublished() has already limited this to the two published statuses.
    status: status === 'not_applicable' ? 'not_applicable' : 'confirmed',
    value: {},
    provenance: row.source ? {} : null,
    confirmed_at: at(now, -(row.confirmedDaysAgo ?? 0)),
  }
}

/** Requirements 2.1: newest of published answers, certificate updates, public documents. */
function lastUpdated(
  published: readonly AnswerRow[],
  includeCertificates: boolean,
  now: Date
): string {
  const days: number[] = published.map((row) => -(row.confirmedDaysAgo ?? 0))
  if (includeCertificates) days.push(...CERTIFICATION_ROWS.map((row) => -row.updatedDaysAgo))
  if (published.some((row) => row.supplier === 'SUP-1')) {
    days.push(
      ...DOCUMENT_ROWS.filter((row) => row.visibility === 'public' && !row.deleted).map(
        (row) => -row.uploadedDaysAgo
      )
    )
  }
  return at(now, Math.max(...days))
}

function buildSupplier1(now: Date): ProfileResponse {
  const published = ANSWER_ROWS.filter((row) => row.supplier === 'SUP-1' && isPublished(row, now))
  const categories: ProfileCategory[] = CATEGORIES.flatMap(({ key, label }) => {
    const answers = published
      .filter((row) => row.category === key)
      .map((row) => toProfileAnswer(row, now))
    // R-7: a category with nothing publishable is left out, not rendered empty.
    return answers.length > 0 ? [{ key, label, answers }] : []
  })
  return {
    schema_version: '1.0',
    organisation: {
      id: SUPPLIER_IDS['SUP-1'],
      name: 'Acme Corporation',
      abn: '12 345 678 901',
      country: 'Australia',
      logo_url: '/trust-page/demo-leaf.svg',
      intro:
        'A fictional promotional products supplier, used to demonstrate the Trust Page. Every detail is invented.',
    },
    last_updated: lastUpdated(published, true, now),
    certifications: CERTIFICATION_ROWS.map((row) => ({
      name: row.standard,
      issuer: row.issuer,
      certificate_number: row.certificateNumber,
      scope: row.scope,
      valid_from: dateAt(now, row.validFromDays),
      valid_to: dateAt(now, row.validToDays),
      status: certificationStatus(row, now),
      // Stays null until Team A decides how a public page reads a private bucket (G-3).
      document_url: null,
    })),
    categories,
  }
}

function buildSupplier2(now: Date): ProfileResponse {
  const published = ANSWER_ROWS.filter((row) => row.supplier === 'SUP-2' && isPublished(row, now))
  return {
    schema_version: '1.0',
    // The thin profile (EC-04, EC-09): no logo, no ABN, no intro, no certificates.
    organisation: {
      id: SUPPLIER_IDS['SUP-2'],
      name: 'Greenleaf Supply Co',
      abn: null,
      country: 'Australia',
      logo_url: null,
      intro: null,
    },
    last_updated: lastUpdated(published, false, now),
    certifications: [],
    categories: CATEGORIES.flatMap(({ key, label }) => {
      const answers = published
        .filter((row) => row.category === key)
        .map((row) => toProfileAnswer(row, now))
      return answers.length > 0 ? [{ key, label, answers }] : []
    }),
  }
}

/** The profile for a supplier, or null where the page is disabled (SUP-3). */
export function buildProfile(supplier: SupplierKey, now: Date): ProfileResponse | null {
  if (supplier === 'SUP-1') return buildSupplier1(now)
  if (supplier === 'SUP-2') return buildSupplier2(now)
  return null
}

export interface StubResponse {
  status: 200 | 400 | 404
  body: unknown
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * What the read endpoint answers for an organisation id (Field Mapping 6.1 and
 * spec section 10). A disabled page and an unknown id share one 404 body, so
 * the endpoint cannot be used to list which suppliers exist (EC-06).
 */
export function respondToProfileRequest(id: string, now: Date): StubResponse {
  if (!UUID.test(id)) return { status: 400, body: { error: 'bad_request' } }
  const supplier = (Object.keys(SUPPLIER_IDS) as SupplierKey[]).find(
    (key) => SUPPLIER_IDS[key] === id
  )
  const profile = supplier ? buildProfile(supplier, now) : null
  if (!profile) return { status: 404, body: { error: 'not_found' } }
  return { status: 200, body: profile }
}

/** Every case in one map, keyed by the id a client would request. */
export function buildAllFixtures(now: Date): Record<string, StubResponse> {
  return Object.fromEntries(
    [...Object.values(SUPPLIER_IDS), UNREGISTERED_ID].map((id) => [
      id,
      respondToProfileRequest(id, now),
    ])
  )
}
