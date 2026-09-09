import assert from "node:assert/strict";

const base = process.env.SSR_BASE_URL ?? "http://localhost:3100";
async function read(path, agent = "TeamB-SSR-Smoke/1.0") {
  const response = await fetch(new URL(path, base), {
    redirect: "manual",
    headers: { "user-agent": agent },
    signal: AbortSignal.timeout(30_000),
  });
  return { response, html: await response.text() };
}
function verify({ response, html }) {
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /text\/html/);
  // Remove all scripts: an RSC payload alone must not pass a visible-HTML check.
  const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  assert.match(visible, /<h1\b[^>]*>Demo Supplier<\/h1>/);
  assert.match(visible, /<title>Demo Supplier \| Team B SSR spike<\/title>/);
  assert.match(
    visible,
    /<meta name="description" content="Synthetic public Trust Page/,
  );
  assert.match(visible, /<meta property="og:title"/);
  assert.match(visible, /<meta name="robots" content="noindex, nofollow"/);
  assert.match(visible, /No certifications published/);
  const timestamp = visible.match(/data-ssr-rendered-at="([^"]+)"/)?.[1];
  assert.ok(timestamp && !Number.isNaN(Date.parse(timestamp)));
  return timestamp;
}
const first = verify(await read("/s/demo-supplier"));
await new Promise((resolve) => setTimeout(resolve, 100));
const second = verify(await read("/s/demo-supplier"));
assert.notEqual(
  first,
  second,
  "Page must execute at request time, not reuse build-time HTML",
);
verify(await read("/s/11111111-1111-4111-8111-111111111111"));
verify(await read("/s/demo-supplier", "Twitterbot/1.0"));
for (const path of ["/s/unknown-supplier", "/s/admin", "/s/%3Cscript%3E"]) {
  const missing = await read(path);
  assert.equal(missing.response.status, 404, path);
  assert.doesNotMatch(missing.html, /data-ssr-rendered-at=/);
}
console.log(
  JSON.stringify(
    {
      status: "PASS",
      base,
      checks: [
        "Unauthenticated HTML",
        "Visible heading without scripts",
        "Title/description/Open Graph",
        "Demo noindex",
        "Per-request rendering",
        "UUID fixture",
        "Crawler metadata",
        "Unknown/reserved/malformed identifiers return 404",
      ],
      first,
      second,
    },
    null,
    2,
  ),
);
