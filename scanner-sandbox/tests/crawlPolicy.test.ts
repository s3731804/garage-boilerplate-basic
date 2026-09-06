import { describe, expect, it } from "vitest";
import { CrawlBudget, evaluateCrawlTarget } from "../src/crawlPolicy.js";

const policy = {
  allowedHosts: ["supplier.example.com"],
  maxPagesPerRun: 2,
  minDelayMs: 1_000,
};

describe("evaluateCrawlTarget", () => {
  it("allows only HTTPS URLs on explicitly approved hosts", () => {
    expect(
      evaluateCrawlTarget("https://supplier.example.com/about", policy),
    ).toEqual({
      allowed: true,
    });
    expect(
      evaluateCrawlTarget("http://supplier.example.com/about", policy).allowed,
    ).toBe(false);
    expect(evaluateCrawlTarget("https://localhost/about", policy).allowed).toBe(
      false,
    );
    expect(
      evaluateCrawlTarget("https://unapproved.example/about", policy).allowed,
    ).toBe(false);
  });
});

describe("CrawlBudget", () => {
  it("enforces the page limit and minimum delay", () => {
    const budget = new CrawlBudget(policy);

    expect(budget.tryConsume(1_000)).toEqual({ allowed: true });
    expect(budget.tryConsume(1_500).allowed).toBe(false);
    expect(budget.tryConsume(2_000)).toEqual({ allowed: true });
    expect(budget.tryConsume(3_000).allowed).toBe(false);
  });
});
