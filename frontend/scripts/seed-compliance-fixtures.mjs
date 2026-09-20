#!/usr/bin/env node
// Builds the placeholder Trust Page fixture (Test Fixture Specification v1.0,
// section 3 fallback): the Field Mapping 6.2 response for SUP-1 and SUP-2, and
// the shared 404 for SUP-3 and an unregistered id.
//
//   node scripts/seed-compliance-fixtures.mjs                  print everything
//   node scripts/seed-compliance-fixtures.mjs --out <dir>      one <id>.json per case
//   node scripts/seed-compliance-fixtures.mjs --now 2026-09-20T00:00:00Z
//
// Dates are offsets from --now (default: the current time), so re-running it
// always gives a fresh, self-consistent set. It touches no database.
// The generator is TypeScript; this relies on Node's built-in type stripping (Node 22.18+).
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { buildAllFixtures } from '../tests/fixtures/compliance-fixtures.ts'

const args = process.argv.slice(2)
const option = (flag) => {
  const index = args.indexOf(flag)
  return index === -1 ? undefined : args[index + 1]
}

const nowArg = option('--now')
const outDir = option('--out')
const now = nowArg ? new Date(nowArg) : new Date()
if (Number.isNaN(now.getTime())) {
  console.error(`--now: "${nowArg}" is not a valid date`)
  process.exit(1)
}

const fixtures = buildAllFixtures(now)

if (!outDir) {
  process.stdout.write(`${JSON.stringify(fixtures, null, 2)}\n`)
} else {
  const target = resolve(outDir)
  mkdirSync(target, { recursive: true })
  for (const [id, response] of Object.entries(fixtures)) {
    writeFileSync(join(target, `${id}.json`), `${JSON.stringify(response, null, 2)}\n`)
  }
  console.log(
    `Wrote ${Object.keys(fixtures).length} fixtures to ${target} (now = ${now.toISOString()})`
  )
}
