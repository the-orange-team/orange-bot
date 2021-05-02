import { SayArguments } from '@slack/bolt';
import { isUrl } from '../utils';

export function textToSlackMessage(command: string, response: string): string | SayArguments {
    if (isUrl(response)) {
        return {
            text: response,
            blocks: [
                {
                    type: 'image',
                    title: {
                        type: 'plain_text',
                        text: command,
                    },
                    block_id: 'orange_image',
                    image_url: response,
                    alt_text: 'piece of shit',
                },
            ],
        };
    } else {
        return response;
    }
}
