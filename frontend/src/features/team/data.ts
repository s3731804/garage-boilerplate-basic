import type { TeamMember } from '@/features/team/types'

// EC-04: "Role missing or empty" is a content-source validation error per
// docs/requirements.md § 5 — fail at module load (build/dev time) rather
// than let a blank role reach the page. TeamMemberCard's `roleLabel`
// fallback is the second, defensive layer in case this check is ever
// bypassed (e.g. content loaded from an external source later).
function assertValidTeamMember(member: TeamMember, index: number): void {
  if (!member.name.trim()) {
    throw new Error(`Team member at index ${index} has no name`)
  }
  if (!member.role.trim()) {
    throw new Error(`Team member "${member.name}" has no role`)
  }
  if (!member.blurb.trim()) {
    throw new Error(`Team member "${member.name}" has no blurb`)
  }
}

const rawTeamMembers: TeamMember[] = [
  {
    name: 'Antony Rajan',
    role: 'Project Manager',
    blurb:
      'Antony coordinates delivery, keeps client communication moving, and helps Team 34 turn decisions into practical next steps.',
  },
  {
    name: 'Morgan Xiao',
    role: 'Business Analyst',
    blurb:
      'Morgan translates client conversations into clear requirements, maps product decisions, and keeps each story focused on measurable outcomes.',
  },
  {
    name: 'Callum Timms',
    role: 'UX Designer',
    blurb:
      'Callum shapes the interface and responsive experience, turning requirements into accessible wireframes that are straightforward to build and use.',
  },
  {
    name: 'William Knights',
    role: 'Developer',
    blurb:
      'William builds and refines the product interface, with a focus on dependable authentication flows, responsive layouts, and maintainable implementation.',
  },
  {
    name: 'Hoang Ha Quoc Huy',
    role: 'Developer',
    blurb:
      'Hoang develops the team-facing experience and integration flow, translating approved designs into tested, accessible, production-ready components.',
  },
]

rawTeamMembers.forEach(assertValidTeamMember)

export const TEAM_MEMBERS: TeamMember[] = rawTeamMembers
