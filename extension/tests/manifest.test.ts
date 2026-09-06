import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

type Manifest = {
  manifest_version: number;
  action?: { default_popup?: string };
  host_permissions?: string[];
};

describe("Chrome extension manifest", () => {
  it("is MV3, opens the popup, and declares the approved form hosts", async () => {
    const manifest = JSON.parse(
      await readFile(
        new URL("../public/manifest.json", import.meta.url),
        "utf8",
      ),
    ) as Manifest;

    expect(manifest.manifest_version).toBe(3);
    expect(manifest.action?.default_popup).toBe("popup.html");
    expect(manifest.host_permissions).toEqual(
      expect.arrayContaining([
        "https://docs.google.com/*",
        "https://forms.office.com/*",
        "https://forms.gle/*",
      ]),
    );
  });
});
