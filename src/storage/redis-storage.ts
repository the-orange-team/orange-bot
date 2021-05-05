import { RedisClient } from 'redis';
import { Storage } from './types';
import { Alias } from '../messages/types';
import { Maybe, safeJSONParser, zip } from '../utils';
import { OperationResult } from './types';

const devModeKey = 'devMode';

export class StorageImplementation implements Storage<Alias> {
    constructor(private client: RedisClient) {}

    async setValue(key: string, value: Alias): Promise<Alias> {
        const promiseRedis = new Promise<Alias>((resolve, reject) => {
            this.client.set(key, JSON.stringify(value), (error) => {
                if (error) reject(error);
                resolve(value);
            });
        });
        return promiseRedis;
    }

    async getValue(key: string): Promise<Maybe<Alias>> {
        const promiseRedis = new Promise<Alias>((resolve, reject) => {
            this.client.get(key, (error, reply) => {
                if (error) {
                    reject(error);
                }
                resolve(safeJSONParser(reply));
            });
        });
        return promiseRedis;
    }

    async getAliasesByKeys(keys: string[]): Promise<Map<string, Alias>> {
        return new Promise<Map<string, Alias>>((resolve, reject) => {
            if (!keys.length) resolve(new Map());
            this.client.mget(keys, (error, values) => {
                if (error) reject(error);

                const valuesParsed =
                    values?.map((value) => safeJSONParser(value)) ?? Array(keys.length).fill(null);
                const aliasKeyValuePair = zip<string, Maybe<Alias>>(keys, valuesParsed);

                const validAliasesPairs = aliasKeyValuePair.filter((pair) => {
                    const [, alias] = pair;
                    return alias != null;
                }) as [string, Alias][];

                resolve(new Map(validAliasesPairs));
            });
        });
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

    async getAllKeys(): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            this.client.keys('*', function (error, keys) {
                if (error) reject(error);
                resolve(keys);
            });
        });
    }

    async getAllAliasesKeys(): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            this.client.keys(':*', function (error, keys) {
                if (error) reject(error);
                resolve(keys);
            });
        });
    }

    //TODO: should avoid deleting keys that are not aliases
    async deleteAllKeys(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.client.flushdb((error) => {
                if (error) reject(error);
                resolve();
            });
        });
    }

    async getDevMode(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.client.get(devModeKey, (error, reply) => {
                if (error) reject(error);
                resolve(safeJSONParser(reply) ?? true);
            });
        });
    }

    async setDevModeTo(value: boolean): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.client.set(devModeKey, JSON.stringify(value), (error) => {
                if (error) reject(error);
                resolve(value);
            });
        });
    }
}
