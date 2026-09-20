export function isDisplayDate(value?: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) return false
  const day = value.slice(0, 10)
  const calendarDate = new Date(`${day}T00:00:00Z`)
  return (
    !Number.isNaN(calendarDate.getTime()) &&
    calendarDate.toISOString().slice(0, 10) === day &&
    !Number.isNaN(new Date(value).getTime())
  )
}

export function DisplayDate({ value }: { value: string }) {
  if (!isDisplayDate(value)) return null
  const date = new Date(value)
  return (
    <time dateTime={value}>
      {new Intl.DateTimeFormat('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(date)}
    </time>
  )
}
