import redisClient from "./redisClient";
import { consola } from "consola";

const logger = consola.withTag("tokenBucket");

class TokenBucket {
    private capacity: number;
    private refillRate: number;
    private identifier: string;
    private readonly KEY_PREFIX = "token_bucket:";
    private readonly EXPIRY_TIME = 3600;

    constructor(capacity: number, refillRate: number, identifier = "default") {
        this.capacity = capacity;
        this.refillRate = refillRate;
        this.identifier = identifier;
        
        this.initBucket().catch(err => {
            logger.error(`Failed to initialize token bucket: ${err.message}`);
        });
    }

    private async initBucket(): Promise<void> {
        const key = this.getKey();
        const exists = await redisClient.get(`${key}:tokens`);
        
        if (!exists) {
            await redisClient.set(`${key}:tokens`, this.capacity, { EX: this.EXPIRY_TIME });
            await redisClient.set(`${key}:lastRefill`, Date.now(), { EX: this.EXPIRY_TIME });
        }
    }

    private getKey(): string {
        return `${this.KEY_PREFIX}${this.identifier}`;
    }

    private async refill(): Promise<{ tokens: number, lastRefill: number }> {
        const key = this.getKey();
        const now = Date.now();
        
        try {
            const tokensStr = await redisClient.get(`${key}:tokens`);
            const lastRefillStr = await redisClient.get(`${key}:lastRefill`);
            
            const currentTokens = tokensStr ? Number.parseFloat(tokensStr) : this.capacity;
            const lastRefill = lastRefillStr ? Number.parseInt(lastRefillStr) : now;
            
            const elapsed = (now - lastRefill) / 1000;
            const tokensToAdd = Math.floor(elapsed * this.refillRate);
            const newTokens = Math.min(this.capacity, currentTokens + tokensToAdd);
            
            if (tokensToAdd > 0) {
                await redisClient.set(`${key}:tokens`, newTokens, { EX: this.EXPIRY_TIME });
                await redisClient.set(`${key}:lastRefill`, now, { EX: this.EXPIRY_TIME });
            }
            
            return { tokens: newTokens, lastRefill: now };
        } catch (error) {
            logger.error(`Redis refill error: ${(error as Error).message}`);
            return { tokens: this.capacity, lastRefill: now };
        }
    }

    public async consume(tokens: number): Promise<boolean> {
        const key = this.getKey();
        
        try {
            const { tokens: currentTokens } = await this.refill();
            
            if (tokens <= currentTokens) {
                const newTokens = currentTokens - tokens;
                await redisClient.set(`${key}:tokens`, newTokens, { EX: this.EXPIRY_TIME });
                return true;
            }
            
            return false;
        } catch (error) {
            logger.error(`Redis consume error: ${(error as Error).message}`);
            return false;
        }
    }

    public async getTokens(): Promise<number> {
        try {
            const { tokens } = await this.refill();
            return tokens;
        } catch (error) {
            logger.error(`Redis getTokens error: ${(error as Error).message}`);
            return this.capacity; // Return max tokens as fallback
        }
    }

    public async setTokens(tokens: number): Promise<void> {
        const key = this.getKey();
        try {
            await redisClient.set(`${key}:tokens`, tokens, { EX: this.EXPIRY_TIME });
        } catch (error) {
            logger.error(`Redis setTokens error: ${(error as Error).message}`);
        }
    }
}

export default TokenBucket;