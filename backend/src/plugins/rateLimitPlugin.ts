import TokenBucket from "@/utils/tokenBucket";
import { Elysia } from "elysia";
import { consola } from "consola";
import { DEFAULT_RATE_LIMIT, DEFAULT_REFILL_RATE } from "@/utils/config";

const logger = consola.withTag("rateLimitPlugin");

const tokenBuckets = new Map<string, TokenBucket>();

export const rateLimitPlugin = new Elysia({
  name: "rateLimitPlugin",
    })
    .macro({
        rateLimit: (options?: {
            limit?: number,
            refill?: number,
            identifier?: string
        }) => ({
            async beforeHandle({ error, set }) {
                const id = options?.identifier ?? "default";
                const limit = options?.limit ?? Number.parseInt(DEFAULT_RATE_LIMIT);
                const refill = options?.refill ?? Number.parseInt(DEFAULT_REFILL_RATE);
                if (Number.isNaN(limit) || Number.isNaN(refill)) {
                    return error(500, "Invalid rate limit configuration");
                }
                if (!tokenBuckets.has(id)) {
                    tokenBuckets.set(id, new TokenBucket(limit, refill, id));
                }
                
                const bucket = tokenBuckets.get(id);
                if (!bucket) {
                    return error(500, "Failed to create token bucket");
                }
                logger.debug(`Tokens: ${await bucket.getTokens()}`);

                set.headers['X-RateLimit-Limit'] = limit;
                set.headers['X-RateLimit-Remaining'] = await bucket.getTokens();

                if (!await bucket.consume(1)) {
                    return error(429, "Rate limit exceeded");
                }
            },
        }),
    });