import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export type RateLimitHelper = {
    rateLimitingType?: "core" | "forcedSlowMode";
    identifier: string;
};
export type RatelimitResponse = {
    /**
     * Whether the request may pass(true) or exceeded the limit(false)
     */
    success: boolean;
    /**
     * Maximum number of requests allowed within a window.
     */
    limit: number;
    /**
     * How many requests the user has left within the current window.
     */
    remaining: number;
    /**
     * Unix timestamp in milliseconds when the limits are reset.
     */
    reset: number;

    pending: Promise<unknown>;
};

function setupRateLimiter() {
    const redis = Redis.fromEnv()
    const limiter = {
        core: new Ratelimit({
            redis,
            analytics: true,
            limiter: Ratelimit.fixedWindow(3, '60s'),
        }),
        forcedSlowMode: new Ratelimit({
            redis,
            analytics: true,
            limiter: Ratelimit.fixedWindow(1, '30s')
        })
    }

    return async function rateLimiter({ rateLimitingType = 'core', identifier }: RateLimitHelper) {
        return limiter[rateLimitingType].limit(identifier)
    }
}

export async function checkRateLimitAndReturnError({
    rateLimitingType = "core",
    identifier,
}: RateLimitHelper) {
    const response = await setupRateLimiter()({ rateLimitingType, identifier });
    const { remaining, reset } = response;

    if (remaining < 1) {
        const convertToSeconds = (ms: number) => Math.floor(ms / 1000);
        const secondsToWait = convertToSeconds(reset - Date.now());
        return new Error(
            `{"message": "RateLimit", "wait":"${secondsToWait}"}`
        )
    }
}
