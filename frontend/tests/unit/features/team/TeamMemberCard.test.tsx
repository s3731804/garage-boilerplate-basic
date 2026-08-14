import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TeamMemberCard } from '@/features/team/components/TeamMemberCard'

const member = {
  name: 'Morgan Xiao',
  role: 'Business Analyst',
  blurb:
    'Morgan turns client conversations into clear requirements and keeps the team aligned on scope, acceptance criteria, and the product outcomes that matter.',
  photo: '/team/morgan-xiao.webp',
}

describe('TeamMemberCard', () => {
  it('lets a user expand and collapse a long biography', () => {
    render(<TeamMemberCard member={member} />)

    const biography = screen.getByText(member.blurb)
    const toggle = screen.getByRole('button', { name: `Read more about ${member.name}` })

    expect(biography).toHaveAttribute('data-expanded', 'false')
    fireEvent.click(toggle)
    expect(biography).toHaveAttribute('data-expanded', 'true')
    expect(screen.getByRole('button', { name: `Show less about ${member.name}` })).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: `Show less about ${member.name}` }))
    expect(biography).toHaveAttribute('data-expanded', 'false')
  })

  it('uses the shared placeholder when a photo fails to load', () => {
    render(<TeamMemberCard member={member} />)

    const photo = screen.getByRole('img', { name: `Photo of ${member.name}` })
    fireEvent.error(photo)

    expect(photo).toHaveAttribute('src', expect.stringContaining('team-placeholder.svg'))
  })
})
