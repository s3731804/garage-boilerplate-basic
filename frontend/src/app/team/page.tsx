import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/actions/auth.actions'
import { TeamMemberCard } from '@/features/team/components/TeamMemberCard'
import { TEAM_MEMBERS } from '@/features/team/data'

export const metadata: Metadata = {
  title: 'Meet Team 34',
  description: 'Meet the team building the enterprise supply chain data portal.',
}

export default async function TeamPage() {
  const session = await getServerSession()
  if (!session) redirect('/auth/signin')

  return (
    <main className="min-h-screen bg-white px-5 py-6 text-black sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mt-8 text-center text-2xl font-semibold tracking-tight sm:mt-4">
          Meet Team 34
        </h1>

        <section
          aria-label="Team members"
          className="mx-auto mt-10 grid max-w-3xl grid-cols-1 items-stretch gap-x-14 gap-y-12 md:grid-cols-2"
        >
          {TEAM_MEMBERS.map((member) => (
            <TeamMemberCard key={member.name} member={member} />
          ))}
        </section>
      </div>
    </main>
  )
}
