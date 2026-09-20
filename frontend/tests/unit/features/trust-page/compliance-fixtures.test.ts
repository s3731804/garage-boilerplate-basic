import { describe, expect, it } from 'vitest'
import type { ProfileResponse } from '@/features/trust-page/profile-response'
import {
  ANSWER_ROWS,
  CERTIFICATION_ROWS,
  DOCUMENT_ROWS,
  SUPPLIER_IDS,
  UNREGISTERED_ID,
  answerKey,
  buildAllFixtures,
  buildProfile,
  respondToProfileRequest,
} from '../../../fixtures/compliance-fixtures'

const NOW = new Date('2026-09-20T00:00:00Z')

// Independent of the generator on purpose: a shared helper would hide a shared mistake.
function daysFrom(base: Date, days: number): string {
  return new Date(base.getTime() + days * 86_400_000).toISOString().slice(0, 10)
}

function profile(supplier: keyof typeof SUPPLIER_IDS, now = NOW): ProfileResponse {
  const result = buildProfile(supplier, now)
  if (!result) throw new Error(`${supplier} has no profile`)
  return result
}

function keysFor(...ids: string[]): string[] {
  return ids.map((id) => {
    const row = ANSWER_ROWS.find((item) => item.id === id)
    if (!row) throw new Error(`Unknown answer ${id}`)
    return answerKey(row)
  })
}

describe('compliance fixtures: certifications (SUP-1)', () => {
  const certs = profile('SUP-1').certifications
  const byName = (name: string) => {
    const cert = certs.find((item) => item.name === name)
    if (!cert) throw new Error(`No certification ${name}`)
    return cert
  }

  it('gives every certificate one of the three statuses, all present in one view (C-6)', () => {
    expect(certs.map((cert) => [cert.name, cert.status])).toEqual([
      ['ISO 14001', 'verified'],
      ['ISO 9001', 'self_declared'],
      ['AS/NZS 4801', 'expired'],
      ['FSC Chain of Custody', 'verified'],
      ['EcoVadis Bronze', 'self_declared'],
      ['Sedex SMETA', 'verified'],
    ])
  })

  it('lets expiry outrank verification: CERT-03 is staff-verified and still Expired (Requirements 3.1)', () => {
    const source = CERTIFICATION_ROWS.find((row) => row.id === 'CERT-03')
    expect(source?.staffVerified).toBe(true)
    expect(byName('AS/NZS 4801').status).toBe('expired')
  })

  it('expresses every date as an offset from the seed date (D-3)', () => {
    for (const row of CERTIFICATION_ROWS) {
      const cert = byName(row.standard)
      expect(cert.valid_from).toBe(daysFrom(NOW, row.validFromDays))
      expect(cert.valid_to).toBe(daysFrom(NOW, row.validToDays))
    }
    expect(byName('AS/NZS 4801').valid_to).toBe('2026-07-22')
    expect(byName('EcoVadis Bronze').valid_to).toBe('2026-10-10')
  })

  it('keeps the same cases whenever it is seeded, so the fixture cannot rot (D-3)', () => {
    const later = new Date(NOW.getTime() + 400 * 86_400_000)
    const statuses = (now: Date) => profile('SUP-1', now).certifications.map((cert) => cert.status)
    expect(statuses(later)).toEqual(statuses(NOW))
  })

  it('leaves issuer, number and scope null on CERT-04 so the card must omit the lines', () => {
    expect(byName('FSC Chain of Custody')).toMatchObject({
      issuer: null,
      certificate_number: null,
      scope: null,
    })
  })

  it('puts CERT-05 inside the 60/30/7 expiry warning band without expiring it', () => {
    const cert = byName('EcoVadis Bronze')
    expect(cert.valid_to).toBe(daysFrom(NOW, 20))
    expect(cert.status).not.toBe('expired')
  })

  it('offers no document URL until G-3 decides how a public page reads a private bucket', () => {
    expect(certs.every((cert) => cert.document_url === null)).toBe(true)
    const linked = DOCUMENT_ROWS.filter((doc) => ['DOC-03', 'DOC-04'].includes(doc.id))
    expect(linked.map((doc) => doc.visibility)).toEqual(['private', 'public'])
  })
})

describe('compliance fixtures: answers (SUP-1)', () => {
  const result = profile('SUP-1')
  const published = result.categories.flatMap((category) => category.answers)
  const publishedKeys = published.map((item) => item.question_key)

  it('publishes exactly the answers that are public and confirmed or not applicable (R-1)', () => {
    expect([...publishedKeys].sort()).toEqual(
      keysFor(
        'ANS-01',
        'ANS-02',
        'ANS-03',
        'ANS-04',
        'ANS-05',
        'ANS-06',
        'ANS-07',
        'ANS-12',
        'ANS-13',
        'ANS-17'
      ).sort()
    )
  })

  it('renders the six categories that have something to show, and omits Packaging (R-7)', () => {
    expect(result.categories.map((category) => category.key)).toEqual([
      'modern_slavery',
      'labour',
      'environment',
      'governance',
      'company',
      'product',
    ])
    const environment = result.categories.find((category) => category.key === 'environment')
    expect(environment?.answers.map((item) => item.question_key)).toEqual(keysFor('ANS-05'))
  })

  it('keeps "Not applicable" answers, which the client confirmed must render (R-4)', () => {
    const notApplicable = published.filter((item) => item.status === 'not_applicable')
    expect(notApplicable.map((item) => item.question_key)).toEqual(keysFor('ANS-07'))
  })

  it('marks an answer stale when its certificate expired or its source document is gone (G-10, EC-07)', () => {
    // Confirmed in the source rows, yet neither reaches the page.
    for (const id of ['ANS-08', 'ANS-16']) {
      expect(ANSWER_ROWS.find((row) => row.id === id)?.status).toBe('confirmed')
    }
    expect(publishedKeys).not.toContain(keysFor('ANS-08')[0])
    expect(publishedKeys).not.toContain(keysFor('ANS-16')[0])
  })

  it('never lets a must-not-appear item into the payload (spec section 9)', () => {
    const json = JSON.stringify(result)
    const excluded = ['ANS-08', 'ANS-09', 'ANS-10', 'ANS-11', 'ANS-14', 'ANS-15', 'ANS-16']
    for (const id of excluded) {
      const row = ANSWER_ROWS.find((item) => item.id === id)
      if (!row) throw new Error(`Unknown answer ${id}`)
      expect(json, `${id} leaked into the payload`).not.toContain(answerKey(row))
      expect(json, `${id} prompt leaked into the payload`).not.toContain(row.prompt)
    }
    expect(json).not.toContain('Certificate of Currency')
    expect(json).not.toContain('"packaging"')
    expect(json).not.toContain('private')
    expect(json).not.toContain('on_request')
  })

  it('keeps the value of a gated (on_request) answer out of the payload entirely (S2-11)', () => {
    // Field Mapping 6.1 rule 4: on_request content is absent, not hidden by the client.
    expect(publishedKeys).not.toContain(keysFor('ANS-10')[0])
  })

  it('leaves value and provenance as placeholders while G-1 and G-2 are open', () => {
    expect(published.every((item) => Object.keys(item.value).length === 0)).toBe(true)
    const byKey = (id: string) => published.find((item) => item.question_key === keysFor(id)[0])
    expect(byKey('ANS-01')?.provenance).toEqual({}) // document source
    expect(byKey('ANS-04')?.provenance).toEqual({}) // scanner URL source
    expect(byKey('ANS-03')?.provenance).toBeNull() // manual: no source line (R-6)
  })

  it('covers every answer type in the standard bank', () => {
    expect(new Set(published.map((item) => item.answer_type))).toEqual(
      new Set([
        'boolean',
        'date',
        'single_select',
        'multi_select',
        'number',
        'long_text',
        'free_text',
        'derived',
      ])
    )
  })

  it('keeps the original date of an answer confirmed by someone who has since left (EC-13)', () => {
    const answer = published.find((item) => item.question_key === keysFor('ANS-17')[0])
    expect(answer?.confirmed_at).toBe('2026-09-15T00:00:00.000Z')
  })
})

describe('compliance fixtures: last_updated (Requirements 2.1)', () => {
  it('is the newest published change, ignoring newer private, gated and deleted items', () => {
    const result = profile('SUP-1')
    // ANS-17, confirmed 5 days ago, is the newest thing a distributor can see.
    expect(result.last_updated).toBe('2026-09-15T00:00:00.000Z')
    // Yet a private answer, a gated audit report and a deleted policy are all newer.
    const private11 = ANSWER_ROWS.find((row) => row.id === 'ANS-11')
    expect(private11?.confirmedDaysAgo).toBeLessThan(5)
    expect(DOCUMENT_ROWS.filter((doc) => doc.uploadedDaysAgo < 5).map((doc) => doc.id)).toEqual([
      'DOC-02',
      'DOC-03',
      'DOC-06',
    ])
  })
})

describe('compliance fixtures: the thin profile (SUP-2)', () => {
  const result = profile('SUP-2')

  it('has only a name and a country, so nothing may render blank (EC-09)', () => {
    expect(result.organisation).toMatchObject({
      name: 'Greenleaf Supply Co',
      abn: null,
      logo_url: null,
      intro: null,
      country: 'Australia',
    })
  })

  it('has no certifications (EC-01) and two categories, including a Not applicable row', () => {
    expect(result.certifications).toEqual([])
    expect(result.categories.map((category) => category.key)).toEqual(['modern_slavery', 'company'])
    const company = result.categories.find((category) => category.key === 'company')
    expect(company?.answers[0]?.status).toBe('not_applicable')
  })
})

describe('compliance fixtures: the read endpoint', () => {
  it('answers a disabled page and an unregistered id byte for byte the same (EC-06)', () => {
    const disabled = respondToProfileRequest(SUPPLIER_IDS['SUP-3'], NOW)
    const unknown = respondToProfileRequest(UNREGISTERED_ID, NOW)
    expect(disabled.status).toBe(404)
    expect(unknown.status).toBe(404)
    expect(JSON.stringify(unknown.body)).toBe(JSON.stringify(disabled.body))
  })

  it('rejects a malformed id with 400 and serves an enabled page with 200', () => {
    expect(respondToProfileRequest('not-a-uuid', NOW).status).toBe(400)
    expect(respondToProfileRequest(SUPPLIER_IDS['SUP-1'], NOW).status).toBe(200)
    expect(respondToProfileRequest(SUPPLIER_IDS['SUP-2'], NOW).status).toBe(200)
  })

  it('is idempotent: the same seed date always produces the same fixture (D-6)', () => {
    expect(JSON.stringify(buildAllFixtures(NOW))).toBe(JSON.stringify(buildAllFixtures(NOW)))
  })

  it('stamps every profile with the contract version', () => {
    expect(profile('SUP-1').schema_version).toBe('1.0')
    expect(profile('SUP-2').schema_version).toBe('1.0')
  })
})

// Cases that need something this fixture cannot supply yet.
describe('compliance fixtures: open cases', () => {
  it.todo(
    'ANS-12 escaping (<script>, apostrophe, em dash, emoji): the text lives in `value`, which arrives with G-1'
  )
  it.todo(
    'ANS-10 gated row (title and Request access button): S2-11, and it conflicts with Field Mapping 6.1 rule 4'
  )
  it.todo(
    'P-5 "no placeholder frames" for SUP-2: waiting on a design decision about the logo initials tile'
  )
})
