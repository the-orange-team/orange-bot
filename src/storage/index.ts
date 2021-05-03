import redis, { ClientOpts, RedisClient } from 'redis';
import { safeJSONParser } from '../utils';

const PORT = Number(process.env.REDIS_PORT) || 3333;
const redisUrl = process.env.REDIS_URL || '';
const configClient: ClientOpts = {
    auth_pass: process.env.REDIS_PASSWORD,
};

type ReturnTypeRedis = string | string[] | null;

export interface Storage {
    getValue: (key: string) => Promise<ReturnTypeRedis>;
    setValue: (key: string, value: string | string[]) => Promise<void>;
    listAllValues(): Promise<string[]>;
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
                resolve(safeJSONParser(reply));
            });
        });
        return promiseRedis;
    }

    async listAllValues(): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            this.client.scan('*', (error, result) => {
                if (error) {
                    reject(error);
                }
                resolve(result);
            });
        });
    }
}

const redisClient = redis.createClient(PORT, redisUrl, configClient);

export const storage = new StorageImplementation(redisClient);
