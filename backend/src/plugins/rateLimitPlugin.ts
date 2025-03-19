import TokenBucket from "@/utils/tokenBucket";
import { Elysia } from "elysia";
import { consola } from "consola";

const logger = consola.withTag("rateLimitPlugin");

const DEFAULT_RATE_LIMIT = 10;
const DEFAULT_REFILL_RATE = 1;

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
                const limit = options?.limit ?? DEFAULT_RATE_LIMIT;
                const refill = options?.refill ?? DEFAULT_REFILL_RATE;
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