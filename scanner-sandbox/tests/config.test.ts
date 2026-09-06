import { describe, expect, it } from "vitest";
import { loadScannerConfig } from "../src/config.js";

describe("scanner sandbox configuration", () => {
  it("reads only SCANNER-prefixed settings and defaults to dry-run", () => {
    const config = loadScannerConfig({
      SCANNER_ALLOWED_HOSTS: "one.example,two.example",
      SCANNER_DRY_RUN: "false",
      NEXT_PUBLIC_FIREBASE_API_KEY: "must-not-leak",
    });

    expect(config.allowedHosts).toEqual(["one.example", "two.example"]);
    expect(config.dryRun).toBe(false);
    expect(JSON.stringify(config)).not.toContain("must-not-leak");
    expect(loadScannerConfig({}).dryRun).toBe(true);
  });
});
