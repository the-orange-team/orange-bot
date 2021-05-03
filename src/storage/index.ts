import redis, { ClientOpts, RedisClient } from 'redis';
import { safeJSONParser } from '../utils';

const PORT = Number(process.env.REDIS_PORT) || 3333;
const redisUrl = process.env.REDIS_URL || '';
const configClient: ClientOpts = {
    auth_pass: process.env.REDIS_PASSWORD,
};

type ReturnTypeRedis = string | string[] | null;

interface OperationResult {
    success: boolean;
    error?: string;
}
export interface Storage {
    getValue: (key: string) => Promise<ReturnTypeRedis>;
    setValue: (key: string, value: string | string[]) => Promise<void>;
    deleteValue: (key: string) => Promise<OperationResult>;
    listAllKeysStartingFrom: (cursor: string) => Promise<[string, string[]]>;
    deleteAllKeys: () => Promise<void>;
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

    async deleteValue(key: string): Promise<OperationResult> {
        return new Promise<OperationResult>((resolve, reject) => {
            this.client.del(key, function (err, result) {
                // result: 0 - not successful, 1 - successful
                if (err) reject({ error: err, success: false });

                resolve({
                    success: Boolean(result),
                });
            });
        });
    }

    async listAllKeysStartingFrom(cursor: string): Promise<[string, string[]]> {
        return new Promise<[string, string[]]>((resolve, reject) => {
            this.client.scan(cursor, 'MATCH', '*', (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    async deleteAllKeys(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.client.flushdb((error, result) => {
                if (error) reject(error);
                resolve();
            });
        });
    }
}

const redisClient = redis.createClient(PORT, redisUrl, configClient);

export const storage = new StorageImplementation(redisClient);
