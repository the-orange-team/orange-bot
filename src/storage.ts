import { Tedis } from "tedis";

const tedis = new Tedis({
    host: process.env.REDIS_URL,
    port: Number(process.env.REDIS_PORT) || 11838,
    password: process.env.REDIS_PASSWORD
});

export const setValue = async (key: string, value: string): Promise<any> => tedis.set(key, value);
export const getValue = async (key: string): Promise<string | number | null> => tedis.get(key);
