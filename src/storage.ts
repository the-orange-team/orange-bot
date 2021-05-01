import redis, {ClientOpts} from 'redis'

const PORT = Number(process.env.REDIS_PORT) || 3333;
const redisUrl = process.env.REDIS_URL || '';
const configClient: ClientOpts= {
    auth_pass: process.env.REDIS_PASSWORD,
};

const client = redis.createClient(PORT, redisUrl, configClient)

type ReturnTypeRedis = string | number | null

export async function getValue(key: string): Promise<ReturnTypeRedis>{
    const promiseRedis = new Promise<ReturnTypeRedis>((resolve, reject)=>{
        client.get(key, (error, reply) => {
            if(error) {
                reject(error);
            }
            resolve(reply);
        });
    });
    return promiseRedis;
}
export async function setValue(key: string, value: string): Promise<void> {
    const promiseRedis = new Promise<void>((resolve, reject)=>{
        client.set(key, value, (error) => {
            if(error) {
                reject(error);
            }
            resolve();
        });
    });
    return promiseRedis;
}

