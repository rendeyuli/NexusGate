import { consume, type TokenBucketOptions } from "@/utils/tokenBucket";
import { Elysia } from "elysia";
import { DEFAULT_RATE_LIMIT, DEFAULT_REFILL_RATE } from "@/utils/config";
import { apiKeyPlugin } from "./apiKeyPlugin";

export const rateLimitPlugin = new Elysia({
  name: "rateLimitPlugin",
})
  .use(apiKeyPlugin)
  .macro({
    rateLimit: (options?: {
      limit?: number;
      refill?: number;
      identifier?: string;
    }) => ({
      async beforeHandle({ error, set, bearer }) {
        const limit = options?.limit ?? DEFAULT_RATE_LIMIT;
        const refill = options?.refill ?? DEFAULT_REFILL_RATE;
        if (Number.isNaN(limit) || Number.isNaN(refill)) {
          return error(500, "Invalid rate limit configuration");
        }

        const opt = {
          capacity: limit,
          refillRate: refill,
          identifier: options?.identifier ?? "default",
          apikey: bearer,
        } as TokenBucketOptions;

        const newTokens = await consume(opt, 1);

        if (newTokens === false) {
          return error(429, "Rate limit exceeded");
        }
        
        set.headers['X-RateLimit-Limit'] = limit;
        set.headers['X-RateLimit-Remaining'] = newTokens;
      },
    }),
  });
