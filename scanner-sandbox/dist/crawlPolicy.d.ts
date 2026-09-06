export type CrawlPolicy = {
    allowedHosts: string[];
    maxPagesPerRun: number;
    minDelayMs: number;
};
export type PolicyDecision = {
    allowed: true;
} | {
    allowed: false;
    reason: string;
};
export declare function evaluateCrawlTarget(target: string, policy: CrawlPolicy): PolicyDecision;
export declare class CrawlBudget {
    #private;
    constructor(policy: CrawlPolicy);
    tryConsume(nowMs: number): PolicyDecision;
}
