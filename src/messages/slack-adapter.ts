import { SayArguments, SectionBlock, SlashCommand } from '@slack/bolt';
import { isMediaUrl, isUrl, Maybe, removeStringExtraSpaces } from '../utils';
import { Alias, AliasList } from './types';

export async function textToSlackMessage(
    command: string,
    response: string,
    ts: string | undefined
): Promise<string | SayArguments> {
    if (await isMediaUrl(response)) {
        return {
            text: response,
            thread_ts: ts,
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
        return {
            text: response,
            thread_ts: ts
        };
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

export function slackCommandToCommand(slackCommand: SlashCommand): Maybe<Alias> {
    const regex = /^([^: ]*[^: ]) -v (.*)$/;
    const trimmedString = removeStringExtraSpaces(slackCommand.text);
    const args = regex.exec(trimmedString);

    if (!args) return null;

    const [, commandName, values] = args; // ignoring full match (first element)
    return {
        text: commandName.toLocaleLowerCase(),
        userId: slackCommand.user_id,
        values: values.includes(' ') ? values.split(' ') : [values],
    };
}

export const addTextSectionToBlocks = (text: string, blocks: Array<SectionBlock>): void => {
    const textSection = {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text,
        },
    };

    if (blocks.length) {
        textSection.text.text = '\n' + textSection.text.text;
    }

    blocks.push(textSection as SectionBlock);
};

export function aliasListToSlackBlock({ userAliases, otherAliases }: AliasList): SectionBlock[] {
    const commandResultBlocks: SectionBlock[] = [];
    const getAliasesText = (aliases: Alias[]) => aliases.map((alias) => `:${alias.text}`);

    if (userAliases.length) {
        addTextSectionToBlocks(
            `*Your aliases:*\n${getAliasesText(userAliases).join('\n')}`,
            commandResultBlocks
        );
    }

    if (otherAliases.length) {
        addTextSectionToBlocks(
            `*Others' aliases:*\n${getAliasesText(otherAliases).join('\n')}`,
            commandResultBlocks
        );
    }

    return commandResultBlocks;
}
