import { getRandomElement, isUrl } from '../utils';
import { getValue } from '../storage';

export async function returnValue(command: string): Promise<string | {
    text: string;
    blocks: {
        type: string;
        title: {
            type: string;
            text: any;
        };
        block_id: string;
        image_url: string;
        alt_text: string;
    }[];
}>{
    const response = await getValue(command);
    if (response) { 
        const selectedResponse = response instanceof Array? getRandomElement(response) : response;

        if (isUrl(selectedResponse)){
            return {
                text: selectedResponse,
                blocks: [{
                    type: 'image',
                    title: {
                        type: 'plain_text',
                        text: command
                    },
                    block_id: 'orange_image',
                    image_url: selectedResponse,
                    alt_text: 'piece of shit'
                }]
            };
        } else {
            return selectedResponse;
        }
    }
    else { 
        return "command doesn't exist";
    }
}