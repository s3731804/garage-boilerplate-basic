import assert from 'node:assert/strict'

// Run against the local production build. No credentials or live supplier data.
const origin = process.env.S23_PREVIEW_ORIGIN || 'http://127.0.0.1:3103'
for (const scenario of ['full', 'thin', 'empty', 'long']) {
  const response = await fetch(`${origin}/preview/s2-3?scenario=${scenario}`)
  assert.equal(response.status, 200, `${scenario}: HTTP status`)
  const html = await response.text()
  // Inspect rendered HTML, not the embedded React transport payload.
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]
  assert.ok(main, `${scenario}: server-rendered main content`)
  assert.match(main, /Synthetic data only/)
  assert.doesNotMatch(main, /<a[^>]+(?:download|\.pdf)/i)
  if (scenario === 'full') {
    for (const label of ['Verified', 'Self-declared', 'Expired on', 'DEMO-ENV-001']) {
      assert.ok(main.includes(label), `full: ${label} must exist before hydration`)
    }
    assert.equal((main.match(/<article\b/g) || []).length, 3)
  } else if (scenario === 'thin') {
    assert.match(main, /Greenleaf \(thin demo\)/)
    assert.doesNotMatch(main, /<img\b|<dt>ABN<\/dt>|<dt>Issuer<\/dt>|<dt>Last updated<\/dt>/)
  } else if (scenario === 'empty') {
    assert.match(main, /No certifications published/)
    assert.doesNotMatch(main, /<article\b/)
  } else {
    assert.match(main, /LONG-REFERENCE-/)
  }
  console.log(`PASS ${scenario}: server-rendered QA page`)
}

const protectedPage = await fetch(`${origin}/dashboard`, { redirect: 'manual' })
assert.equal(protectedPage.status, 307)
assert.ok(protectedPage.headers.get('location')?.includes('/auth/signin'))
console.log('PASS /dashboard: unauthenticated access still redirects to sign-in')
