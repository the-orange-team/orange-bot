import { getRandomElement, isUrl } from '../utils';
import { Storage } from '../storage';

type SlackReturn =
    | string
    | {
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
      };

export async function returnValue(command: string, storage: Storage): Promise<SlackReturn> {
    const response = await storage.getValue(command);
    if (response) {
        const selectedResponse = response instanceof Array ? getRandomElement(response) : response;

        if (isUrl(selectedResponse)) {
            return {
                text: selectedResponse,
                blocks: [
                    {
                        type: 'image',
                        title: {
                            type: 'plain_text',
                            text: command,
                        },
                        block_id: 'orange_image',
                        image_url: selectedResponse,
                        alt_text: 'piece of shit',
                    },
                ],
            };
        } else {
            return selectedResponse;
        }
    } else {
        return "command doesn't exist";
    }
}
