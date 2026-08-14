'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { TeamMember } from '@/features/team/types'

const PLACEHOLDER_IMAGE = '/team/team-placeholder.svg'

export function TeamMemberCard({ member }: { member: TeamMember }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [imageSource, setImageSource] = useState(member.photo ?? PLACEHOLDER_IMAGE)
  const action = isExpanded ? 'Show less' : 'Read more'

  return (
    <article className="min-h-[22rem] rounded-lg border border-zinc-400 bg-white px-5 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] sm:px-6">
      <h2 className="line-clamp-2 text-base leading-tight font-semibold break-words text-black">
        {member.name}
      </h2>

      <div className="relative mt-5 h-28 w-28 overflow-hidden rounded-full bg-[#ef5847] sm:h-32 sm:w-32">
        <Image
          src={imageSource}
          alt={`Photo of ${member.name}`}
          fill
          sizes="(min-width: 640px) 128px, 112px"
          className="object-cover"
          onError={() => setImageSource(PLACEHOLDER_IMAGE)}
        />
      </div>

      <div className="mt-5">
        <p className="text-sm text-zinc-800">
          <span className="font-semibold text-black">Role:</span> {member.role}
        </p>
        <div className="mt-5">
          <p className="text-sm leading-5 text-zinc-800">
            <span className="font-semibold text-black">About {member.name}:</span>
          </p>
          <p
            data-expanded={isExpanded}
            className={`text-sm leading-5 text-zinc-800 ${isExpanded ? '' : 'line-clamp-4'}`}
          >
            {member.blurb}
          </p>
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-blue-700 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            aria-label={`${action} about ${member.name}`}
            aria-expanded={isExpanded}
          >
            {action}
          </button>
        </div>
      </div>
    </article>
  )
}
