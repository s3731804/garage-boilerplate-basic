const positiveInteger = (value, fallback) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};
export function loadScannerConfig(env) {
    return {
        allowedHosts: (env.SCANNER_ALLOWED_HOSTS ?? "")
            .split(",")
            .map((host) => host.trim().toLowerCase())
            .filter(Boolean),
        maxPagesPerRun: positiveInteger(env.SCANNER_MAX_PAGES_PER_RUN, 25),
        minDelayMs: positiveInteger(env.SCANNER_MIN_DELAY_MS, 2_000),
        dryRun: env.SCANNER_DRY_RUN?.toLowerCase() !== "false",
    };
}
