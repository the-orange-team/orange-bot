import redis, {ClientOpts} from 'redis';

const PORT = Number(process.env.REDIS_PORT) || 3333;
const redisUrl = process.env.REDIS_URL || '';
const configClient: ClientOpts= {
    auth_pass: process.env.REDIS_PASSWORD,
};

const client = redis.createClient(PORT, redisUrl, configClient);

type ReturnTypeRedis = string | string[] | null

export async function getValue(key: string): Promise<ReturnTypeRedis>{
    const promiseRedis = new Promise<ReturnTypeRedis>((resolve, reject)=>{
        client.get(key, (error, reply) => {
            if (error) {
                reject(error);
            }
            resolve(JSON.parse(reply ?? JSON.stringify(null)));
        });
    });
    return promiseRedis;
}

export async function setValue(key: string, value: string | string[]): Promise<void> {
    const promiseRedis = new Promise<void>((resolve, reject) => {
        client.set(key, JSON.stringify(value), (error) => {
            if (error) reject(error);
            resolve();
        });
    });
    return promiseRedis;
}

