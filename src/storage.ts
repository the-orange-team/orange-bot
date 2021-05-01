import redis, {ClientOpts} from 'redis'

const PORT = Number(process.env.REDIS_PORT) || 3333;
const confiClient: ClientOpts= {
    port: PORT,
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD
};

const client = redis.createClient(confiClient)

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

