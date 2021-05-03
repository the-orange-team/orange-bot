import { SayArguments } from '@slack/bolt';
import { isUrl, Maybe } from '../utils';
import { Command } from './types';

export function textToSlackMessage(command: string, response: string): string | SayArguments {
    if (isUrl(response)) {
        return {
            text: response,
            blocks: [
                {
                    type: 'image',
                    title: {
                        type: 'plain_text',
                        text: response,
                    },
                    block_id: 'orange_image',
                    image_url: response,
                    alt_text: command,
                },
            ],
        };
    } else {
        return response;
    }
}

export function tweetToSlackMessage(
    tweet: string,
    mediaUrl: string,
    userName: string
): string | SayArguments {
    if (isUrl(mediaUrl)) {
        return {
            text: tweet,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `${tweet}`,
                    },
                },
                {
                    type: 'image',
                    block_id: 'twitter_image',
                    image_url: mediaUrl,
                    alt_text: `Requested by: ${userName}`,
                },
            ],
        };
    } else {
        return mediaUrl;
    }
}

export function slackCommandToCommand(slackCommand: string): Maybe<Command> {
    const regex = /^([^: ]*[^: ]) returning (.*)$/;
    const args = regex.exec(slackCommand);

    if (!args) return null;

    const [, commandName, values] = args; // ignoring full match (first element)
    return {
        command: commandName,
        values: values.includes(' ') ? values.split(' ') : values,
    };
}
