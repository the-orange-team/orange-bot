import { getRandomElement } from '../utils';
import { Storage } from '../storage';

export const messageStartingWithColonRegex = /^:.*[^:]$/;

export async function returnValue(command: string, storage: Storage): Promise<string> {
    const response = await storage.getValue(command);
    if (response) {
        const selectedResponse = response instanceof Array ? getRandomElement(response) : response;
        return selectedResponse;
    } else {
        return "command doesn't exist";
    }
}
