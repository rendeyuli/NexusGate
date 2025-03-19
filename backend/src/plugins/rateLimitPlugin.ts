import TokenBucket from "@/utils/tokenBucket";
import { Elysia } from "elysia";
import { consola } from "consola";

const logger = consola.withTag("rateLimitPlugin");

const RATE_LIMIT = 10;
const REFILL_RATE = 1;

export const rateLimitPlugin = new Elysia({
  name: "rateLimitPlugin",
    })
    .state("tokenBucket", new TokenBucket(RATE_LIMIT, REFILL_RATE))
    .macro({
        rateLimit: {
            async beforeHandle({ error, store, set }) {
                logger.debug(await store.tokenBucket.getTokens());

                set.headers['X-RateLimit-Limit'] = RATE_LIMIT;
                set.headers['X-RateLimit-Remaining'] = await store.tokenBucket.getTokens();

                if(!await store.tokenBucket.consume(1)) {
                    return error(429, "Rate limit exceeded");
                }
            },
        },
    });