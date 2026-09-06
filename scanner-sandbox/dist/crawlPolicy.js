export function evaluateCrawlTarget(target, policy) {
    let url;
    try {
        url = new URL(target);
    }
    catch {
        return { allowed: false, reason: "Target is not a valid URL" };
    }
    if (url.protocol !== "https:") {
        return { allowed: false, reason: "Only HTTPS targets are permitted" };
    }
    if (url.username || url.password) {
        return { allowed: false, reason: "Credential-bearing URLs are prohibited" };
    }
    const hostname = url.hostname.toLowerCase();
    const allowed = policy.allowedHosts.some((host) => hostname === host.toLowerCase());
    if (!allowed) {
        return { allowed: false, reason: "Host is not on the explicit allowlist" };
    }
    return { allowed: true };
}
export class CrawlBudget {
    #policy;
    #pagesConsumed = 0;
    #lastRequestAt;
    constructor(policy) {
        this.#policy = policy;
    }
    tryConsume(nowMs) {
        if (this.#pagesConsumed >= this.#policy.maxPagesPerRun) {
            return { allowed: false, reason: "Run page budget exhausted" };
        }
        if (this.#lastRequestAt !== undefined &&
            nowMs - this.#lastRequestAt < this.#policy.minDelayMs) {
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
