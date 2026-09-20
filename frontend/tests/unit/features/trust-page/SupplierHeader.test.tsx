import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SupplierHeader } from '@/features/trust-page/SupplierHeader'

describe('SupplierHeader', () => {
  it('renders the public supplier identity and last-updated date', () => {
    render(
      <SupplierHeader
        supplier={{
          name: 'Example Supplier',
          logoUrl: '/example.svg',
          abn: '12 345 678 901',
          country: 'Australia',
          introduction: 'Packaging for local businesses.',
          lastUpdated: '2026-09-18T12:00:00Z',
        }}
      />
    )
    expect(screen.getByRole('heading', { name: 'Example Supplier', level: 1 })).toBeVisible()
    expect(screen.getByRole('img', { name: 'Example Supplier logo' })).toHaveAttribute(
      'src',
      '/example.svg'
    )
    expect(screen.getByText('12 345 678 901')).toBeVisible()
    expect(screen.getByText('Australia')).toBeVisible()
    expect(screen.getByText('Packaging for local businesses.')).toBeVisible()
    expect(screen.getByText('18 Sept 2026')).toHaveAttribute('dateTime', '2026-09-18T12:00:00Z')
  })
  it('shows an initials tile, not an image, when the supplier has no logo', () => {
    render(<SupplierHeader supplier={{ name: 'Acme Corporation' }} />)
    expect(screen.getByText('AC')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
  it('omits absent fields and invalid dates instead of rendering blank labels', () => {
    const { container } = render(
      <SupplierHeader
        supplier={{
          name: 'Thin Supplier',
          logoUrl: ' ',
          abn: ' ',
          country: null,
          introduction: '',
          lastUpdated: 'not-a-date',
        }}
      />
    )
    expect(screen.getByRole('heading', { name: 'Thin Supplier' })).toBeVisible()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(container.querySelectorAll('dt')).toHaveLength(0)
    expect(container.querySelector('time')).toBeNull()
  })
})
