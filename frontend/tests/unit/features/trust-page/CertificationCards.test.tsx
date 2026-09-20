import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CertificationCards } from '@/features/trust-page/CertificationCards'

describe('CertificationCards', () => {
  it('renders a certification with its issuer, number, validity and text status', () => {
    render(
      <CertificationCards
        certifications={[
          {
            id: 'iso',
            name: 'ISO 14001',
            issuer: 'Example Registry',
            certificateNumber: 'DEMO-001',
            validFrom: '2025-01-01',
            validUntil: '2027-01-01',
            status: 'verified',
          },
        ]}
      />
    )
    const card = screen.getByRole('article', { name: 'ISO 14001' })
    expect(within(card).getByText('Example Registry')).toBeVisible()
    expect(within(card).getByText('DEMO-001')).toBeVisible()
    expect(within(card).getByText('1 Jan 2025')).toHaveAttribute('dateTime', '2025-01-01')
    expect(within(card).getByText('1 Jan 2027')).toHaveAttribute('dateTime', '2027-01-01')
    expect(within(card).getByText('Verified')).toBeVisible()
  })
  it('shows an explicit empty state when there are no certifications', () => {
    render(<CertificationCards certifications={[]} />)
    expect(screen.getByText('No certifications published')).toBeVisible()
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })
  it('identifies expired dates in text as well as styling, using the server status', () => {
    render(
      <CertificationCards
        certifications={[
          { id: 'old', name: 'Old certificate', status: 'expired', validUntil: '2025-08-31' },
          { id: 'self', name: 'Supplier claim', status: 'self-declared' },
        ]}
      />
    )
    const expiredCard = screen.getByRole('article', { name: 'Old certificate' })
    expect(within(expiredCard).getByText('Expired')).toBeVisible()
    expect(within(expiredCard).getByText('Expired on')).toBeVisible()
    expect(within(expiredCard).getByText('31 Aug 2025')).toHaveAttribute('dateTime', '2025-08-31')
    expect(screen.getByText('Self-declared')).toBeVisible()
    expect(screen.getAllByRole('article')).toHaveLength(2)
  })
  it('omits null, blank and invalid fields without empty labels', () => {
    const { container } = render(
      <CertificationCards
        certifications={[
          {
            id: 'thin',
            name: 'Thin certificate',
            status: 'self-declared',
            issuer: ' ',
            certificateNumber: null,
            validFrom: 'invalid',
            validUntil: '2026-02-30',
          },
        ]}
      />
    )
    expect(screen.getByText('Thin certificate')).toBeVisible()
    expect(container.querySelectorAll('dt')).toHaveLength(0)
    expect(container.querySelectorAll('time')).toHaveLength(0)
  })
  it('does not expose certificate download links while G-3 is unresolved', () => {
    const certificate = {
      id: 'cert',
      name: 'Certificate',
      status: 'verified' as const,
      downloadUrl: 'https://example.org/private.pdf',
    }
    const { container } = render(<CertificationCards certifications={[certificate]} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(container.innerHTML).not.toContain('private.pdf')
  })
  it('renders untrusted certificate text as text, not markup', () => {
    const text = '<img src=x onerror=alert(1)>'
    const { container } = render(
      <CertificationCards
        certifications={[
          { id: 'text', name: text, issuer: '<script>alert(1)</script>', status: 'self-declared' },
        ]}
      />
    )
    expect(screen.getByRole('heading', { name: text })).toBeVisible()
    expect(container.querySelector('img, script')).toBeNull()
  })
})
