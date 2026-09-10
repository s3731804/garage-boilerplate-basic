export type CrawlPolicy = {
  allowedHosts: string[];
  maxPagesPerRun: number;
  minDelayMs: number;
};

export type PolicyDecision =
  { allowed: true } | { allowed: false; reason: string };

export function evaluateCrawlTarget(
  target: string,
  policy: CrawlPolicy,
): PolicyDecision {
  let url: URL;
  try {
    url = new URL(target);
  } catch {
    return { allowed: false, reason: "Target is not a valid URL" };
  }

  if (url.protocol !== "https:") {
    return { allowed: false, reason: "Only HTTPS targets are permitted" };
  }

  if (url.username || url.password) {
    return { allowed: false, reason: "Credential-bearing URLs are prohibited" };
  }

  const hostname = url.hostname.toLowerCase();
  // Deny local/IP targets even if accidentally added to the allowlist.
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.startsWith("[") ||
    /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)
  ) {
    return {
      allowed: false,
      reason: "Local hosts and IP literals are prohibited",
    };
  }
  const allowed = policy.allowedHosts.some(
    (host) => hostname === host.toLowerCase(),
  );
  if (!allowed) {
    return { allowed: false, reason: "Host is not on the explicit allowlist" };
  }

  return { allowed: true };
}

export class CrawlBudget {
  readonly #policy: CrawlPolicy;
  #pagesConsumed = 0;
  #lastRequestAt: number | undefined;

  constructor(policy: CrawlPolicy) {
    this.#policy = policy;
  }

  tryConsume(nowMs: number): PolicyDecision {
    if (this.#pagesConsumed >= this.#policy.maxPagesPerRun) {
      return { allowed: false, reason: "Run page budget exhausted" };
    }

    if (
      this.#lastRequestAt !== undefined &&
      nowMs - this.#lastRequestAt < this.#policy.minDelayMs
    ) {
      return {
        allowed: false,
        reason: "Minimum request delay has not elapsed",
      };
    }

    this.#pagesConsumed += 1;
    this.#lastRequestAt = nowMs;
    return { allowed: true };
  }
}
