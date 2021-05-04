import redis, { ClientOpts, RedisClient } from 'redis';
import { Command } from '../messages/types';
import { Maybe, safeJSONParser } from '../utils';

const PORT = Number(process.env.REDIS_PORT) || 3333;
const redisUrl = process.env.REDIS_URL || '';
const configClient: ClientOpts = {
    auth_pass: process.env.REDIS_PASSWORD,
};

interface OperationResult {
    success: boolean;
    error?: string;
}
export interface Storage<T> {
    getValue: (key: string) => Promise<Maybe<T>>;
    setValue: (key: string, value: T) => Promise<Command>;
    listAllKeysStartingFrom: (cursor: string) => Promise<[string, string[]]>;
    deleteAllKeys: () => Promise<void>;
    deleteValue: (key: string) => Promise<OperationResult>;
}

class StorageImplementation implements Storage<Command> {
    constructor(private client: RedisClient) {}

    async setValue(key: string, value: Command): Promise<Command> {
        const promiseRedis = new Promise<Command>((resolve, reject) => {
            this.client.set(key, JSON.stringify(value), (error) => {
                if (error) reject(error);
                resolve(value);
            });
        });
        return promiseRedis;
    }

    async getValue(key: string): Promise<Maybe<Command>> {
        const promiseRedis = new Promise<Command>((resolve, reject) => {
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
