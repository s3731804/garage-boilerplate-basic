import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import { loadScannerConfig } from "../dist/config.js";
import { evaluateCrawlTarget, CrawlBudget } from "../dist/crawlPolicy.js";

assert.notEqual(process.getuid(), 0, "Must not run as root");
const status = await fs.readFile("/proc/self/status", "utf8");
assert.match(status, /CapEff:\s+0+\s/);
assert.match(status, /NoNewPrivs:\s+1/);
assert.deepEqual(
  Object.keys(os.networkInterfaces()).filter((name) => name !== "lo"),
  [],
);
const mounts = await fs.readFile("/proc/mounts", "utf8");
const rootMount = mounts.split("\n").find((line) => line.split(" ")[1] === "/");
assert.ok(
  rootMount?.split(" ")[3].split(",").includes("ro"),
  "Root filesystem must be read-only",
);
assert.deepEqual(
  Object.keys(process.env).filter((name) =>
    /FIREBASE|SUPABASE|DATABASE_URL|SERVICE_ACCOUNT/i.test(name),
  ),
  [],
);
await assert.rejects(
  fs.writeFile("/workspace/write-probe", "must fail"),
  (error) => ["EROFS", "EACCES"].includes(error.code),
);
const config = loadScannerConfig(process.env);
assert.equal(config.dryRun, true);
assert.deepEqual(config.allowedHosts, []);
assert.equal(
  evaluateCrawlTarget("https://supplier.example", config).allowed,
  false,
);
const budget = new CrawlBudget({ ...config, maxPagesPerRun: 1 });
assert.equal(budget.tryConsume(0).allowed, true);
assert.equal(budget.tryConsume(5000).allowed, false);
console.log(
  JSON.stringify(
    {
      status: "PASS",
      node: process.version,
      uid: process.getuid(),
      checks: [
        "non-root",
        "no Linux capabilities",
        "no-new-privileges",
        "network none",
        "read-only root",
        "no application credentials",
        "dry-run true",
        "empty default allowlist",
        "page budget enforced",
      ],
      scope: "Local/CI container isolation proof. Live crawling disabled.",
    },
    null,
    2,
  ),
);
