import type { CrawlPolicy } from "./crawlPolicy.js";
export type ScannerConfig = CrawlPolicy & {
    dryRun: boolean;
};
export declare function loadScannerConfig(env: Record<string, string | undefined>): ScannerConfig;
