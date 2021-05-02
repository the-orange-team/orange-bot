import redis, { ClientOpts, RedisClient } from 'redis';

const PORT = Number(process.env.REDIS_PORT) || 3333;
const redisUrl = process.env.REDIS_URL || '';
const configClient: ClientOpts = {
    auth_pass: process.env.REDIS_PASSWORD,
};

type ReturnTypeRedis = string | string[] | null;

export interface Storage {
    getValue: (key: string) => Promise<ReturnTypeRedis>;
    setValue: (key: string, value: string | string[]) => Promise<void>;
}

class StorageImplementation implements Storage {
    constructor(private client: RedisClient) {}

    async setValue(key: string, value: string | string[]): Promise<void> {
        const promiseRedis = new Promise<void>((resolve, reject) => {
            this.client.set(key, JSON.stringify(value), (error) => {
                if (error) reject(error);
                resolve();
            });
        });
        return promiseRedis;
    }

    async getValue(key: string): Promise<ReturnTypeRedis> {
        const promiseRedis = new Promise<ReturnTypeRedis>((resolve, reject) => {
            this.client.get(key, (error, reply) => {
                if (error) {
                    reject(error);
                }
                resolve(JSON.parse(reply ?? JSON.stringify(null)));
            });
        });
        return promiseRedis;
    }
}

const redisClient = redis.createClient(PORT, redisUrl, configClient);

export const storage = new StorageImplementation(redisClient);
