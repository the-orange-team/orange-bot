import redis, { ClientOpts } from 'redis';
import { StorageImplementation } from './redis-storage';
export * from './types';

const redisUrl = process.env.REDIS_URL || '';
const configClient: ClientOpts = {    
    url: redisUrl
};

const redisClient = redis.createClient(configClient);

export const storage = new StorageImplementation(redisClient);
