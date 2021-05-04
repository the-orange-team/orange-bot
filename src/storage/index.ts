import redis, { ClientOpts } from 'redis';
import { StorageImplementation } from './redis-storage';
export * from './types';

const PORT = Number(process.env.REDIS_PORT) || 3333;
const redisUrl = process.env.REDIS_URL || '';
const configClient: ClientOpts = {
    auth_pass: process.env.REDIS_PASSWORD,
};

const redisClient = redis.createClient(PORT, redisUrl, configClient);

export const storage = new StorageImplementation(redisClient);
