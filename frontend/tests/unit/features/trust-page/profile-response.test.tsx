import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CertificationCards } from '@/features/trust-page/CertificationCards'
import { SupplierHeader } from '@/features/trust-page/SupplierHeader'
import {
  toCertifications,
  toSupplierHeader,
  type ProfileResponse,
} from '@/features/trust-page/profile-response'
import { buildProfile } from '../../../fixtures/compliance-fixtures'

const NOW = new Date('2026-09-20T00:00:00Z')

function profile(supplier: 'SUP-1' | 'SUP-2'): ProfileResponse {
  const result = buildProfile(supplier, NOW)
  if (!result) throw new Error(`${supplier} has no profile`)
  return result
}

function card(name: string): HTMLElement {
  return screen.getByRole('article', { name })
}

describe('S2-3 against the fixture: certification cards (SUP-1)', () => {
  const renderCards = () =>
    render(<CertificationCards certifications={toCertifications(profile('SUP-1'))} />)

  it('shows Verified, Self-declared and Expired chips together, one per certificate state', () => {
    renderCards()
    expect(screen.getAllByText('Verified')).toHaveLength(3)
    expect(screen.getAllByText('Self-declared')).toHaveLength(2)
    expect(screen.getAllByText('Expired')).toHaveLength(1)
  })

  it('shows CERT-03 as Expired, not Verified, though a staff member verified it', () => {
    renderCards()
    const cert = card('AS/NZS 4801')
    expect(within(cert).getByText('Expired')).toBeInTheDocument()
    expect(within(cert).queryByText('Verified')).not.toBeInTheDocument()
    // The date carries the expiry cue for screen readers, not colour alone.
    expect(within(cert).getByText('(expired)')).toBeInTheDocument()
  })

  it('omits the issuer and number lines on CERT-04 instead of rendering them blank', () => {
    renderCards()
    const cert = card('FSC Chain of Custody')
    expect(within(cert).queryByText('Issuer')).not.toBeInTheDocument()
    expect(within(cert).queryByText('Cert No')).not.toBeInTheDocument()
    expect(within(cert).getByText('Valid')).toBeInTheDocument()
  })

  it('renders the full detail on a complete certificate', () => {
    renderCards()
    const cert = card('ISO 14001')
    expect(within(cert).getByText('Example Certification Body (fictional)')).toBeInTheDocument()
    expect(within(cert).getByText('FX-14001-0001')).toBeInTheDocument()
  })

  it('renders no download link on any card, including CERT-06 whose document is private (C-7)', () => {
    renderCards()
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })

  it('gives every certificate a chip with a text label (X-7)', () => {
    renderCards()
    for (const name of [
      'ISO 14001',
      'ISO 9001',
      'AS/NZS 4801',
      'FSC Chain of Custody',
      'EcoVadis Bronze',
      'Sedex SMETA',
    ]) {
      expect(within(card(name)).getByText(/^(Verified|Self-declared|Expired)$/)).toBeInTheDocument()
    }
  })
})

describe('S2-3 against the fixture: the thin profile (SUP-2)', () => {
  it('shows an explicit empty state when there are no certifications (EC-01)', () => {
    render(<CertificationCards certifications={toCertifications(profile('SUP-2'))} />)
    expect(screen.getByText('No certifications published')).toBeInTheDocument()
    expect(screen.queryAllByRole('article')).toHaveLength(0)
  })

  it('renders no ABN, intro or logo image, and no empty labels (EC-09)', () => {
    const { container } = render(<SupplierHeader supplier={toSupplierHeader(profile('SUP-2'))} />)
    expect(
      screen.getByRole('heading', { name: 'Greenleaf Supply Co', level: 1 })
    ).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    // Country is the only fact, so it is the only label.
    expect(Array.from(container.querySelectorAll('dt')).map((term) => term.textContent)).toEqual([
      'Country',
    ])
    expect(container.querySelector('p')?.textContent).toContain('Last updated')
  })
})

describe('S2-3 against the fixture: the header (SUP-1)', () => {
  it('renders the identity, logo and the derived last-updated date', () => {
    render(<SupplierHeader supplier={toSupplierHeader(profile('SUP-1'))} />)
    expect(screen.getByRole('heading', { name: 'Acme Corporation', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Acme Corporation logo' })).toHaveAttribute(
      'src',
      '/trust-page/demo-leaf.svg'
    )
    expect(screen.getByText('12 345 678 901')).toBeInTheDocument()
    expect(screen.getByText('15 Sept 2026')).toHaveAttribute('dateTime', '2026-09-15T00:00:00.000Z')
  })
})

describe('profile response mapping', () => {
  it('turns the contract’s snake_case status into the card status', () => {
    const statuses = toCertifications(profile('SUP-1')).map((cert) => cert.status)
    expect(statuses).toEqual([
      'verified',
      'self-declared',
      'expired',
      'verified',
      'self-declared',
      'verified',
    ])
  })

  it('gives each certificate a distinct id, since the contract carries none', () => {
    const ids = toCertifications(profile('SUP-1')).map((cert) => cert.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('does not pass scope or document_url on to the cards', () => {
    const [first] = toCertifications(profile('SUP-1'))
    expect(first).not.toHaveProperty('scope')
    expect(first).not.toHaveProperty('documentUrl')
  })
})
