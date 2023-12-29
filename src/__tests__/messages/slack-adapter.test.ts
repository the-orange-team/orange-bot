import { SayArguments, SectionBlock } from '@slack/bolt';
import * as adapter from '../../messages/slack-adapter';
import { Alias } from '../../messages';
import { isMediaUrl } from '../../utils';
import { buildSlashcommand } from '../../__mocks__/slack-api';

jest.mock('../../utils', () => ({
    ...jest.requireActual('../../utils'),
    isMediaUrl: jest.fn(),
}));

const mockedIsMediaUrl = <jest.Mock>isMediaUrl;

describe('textToSlackMessage', () => {
    test('Given a text return the text', async () => {
        mockedIsMediaUrl.mockImplementationOnce(() => false);
        expect(await adapter.textToSlackMessage(':some-command', 'some text', '1')).toEqual(
            { 'text': 'some text', 'thread_ts': '1' },
        );
    });
    test('Given a not media url return the text', async () => {
        mockedIsMediaUrl.mockImplementationOnce(() => false);
        expect(
            await adapter.textToSlackMessage(
                ':some-command',
                'https://media.giphy.com/media/hhjfuAcwCGFOM/giphy.gif',
                '1',
            ),
        ).toEqual({ 'text': 'https://media.giphy.com/media/hhjfuAcwCGFOM/giphy.gif', 'thread_ts': '1' });
    });
    test('Given a media url return the slack say argument', async () => {
        mockedIsMediaUrl.mockImplementationOnce(() => true);
        expect(
            await adapter.textToSlackMessage(
                'some-command',
                'https://media.giphy.com/media/hhjfuAcwCGFOM/giphy.gif',
                '1',
            ),
        ).toEqual<SayArguments>({
            text: 'https://media.giphy.com/media/hhjfuAcwCGFOM/giphy.gif',
            thread_ts: '1',
            blocks: [
                {
                    type: 'image',
                    title: {
                        type: 'plain_text',
                        text: 'https://media.giphy.com/media/hhjfuAcwCGFOM/giphy.gif',
                    },
                    block_id: 'orange_image',
                    image_url: 'https://media.giphy.com/media/hhjfuAcwCGFOM/giphy.gif',
                    alt_text: 'some-command',
                },
            ],
        });
    });
});

describe('tweetToSlackMessage', () => {
    test('Given a text tweet returns the tweet string', () => {
        expect(adapter.textWithImageToSlackMessage({
            text: 'some text',
            mediaUrl: 'some image url',
            userName: 'testUser',
        })).toEqual(
            'some image url',
        );
    });
    test('Given a media tweet returns a slack message', () => {
        expect(
            adapter.textWithImageToSlackMessage({
                text: 'some text',
                mediaUrl: 'https://media.giphy.com/media/hhjfuAcwCGFOM/giphy.gif',
                userName: 'testUser',
            }),
        ).toEqual<SayArguments>({
            text: 'some text',
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: 'some text',
                    },
                },
                {
                    type: 'image',
                    block_id: 'orange_image',
                    image_url: 'https://media.giphy.com/media/hhjfuAcwCGFOM/giphy.gif',
                    alt_text: `Requested by: testUser`,
                },
            ],
        });
    });
});

describe('slackCommandToCommand', () => {
    test('given a correct command with one value', () => {
        const slashCommand = buildSlashcommand('test -v tested', '123');
        expect(adapter.slackCommandToCommand(slashCommand)).toEqual<Alias>({
            text: 'test',
            userId: '123',
            values: ['tested'],
        });
    });

    test('given a correct command with multiple values', () => {
        const slashCommand = buildSlashcommand('flipcoin -v tails heads', '123');
        expect(adapter.slackCommandToCommand(slashCommand)).toEqual<Alias>({
            text: 'flipcoin',
            userId: '123',
            values: ['tails', 'heads'],
        });
    });

    test('given a correct command -v url', () => {
        const slashCommand = buildSlashcommand(
            'cat -v https://media.giphy.com/media/BzyTuYCmvSORqs1ABM/giphy.gif',
            '123',
        );
        expect(adapter.slackCommandToCommand(slashCommand)).toEqual<Alias>({
            text: 'cat',
            userId: '123',
            values: ['https://media.giphy.com/media/BzyTuYCmvSORqs1ABM/giphy.gif'],
        });
    });

    test('given a command with multiple values and extra spaces', () => {
        expect(
            adapter.slackCommandToCommand(
                buildSlashcommand('flipcoin -v tails heads   draw', '123'),
            ),
        ).toEqual<Alias>({
            text: 'flipcoin',
            userId: '123',
            values: ['tails', 'heads', 'draw'],
        });
    });

    describe('given a incorrect command return null', () => {
        test('command starting with :', () => {
            expect(
                adapter.slackCommandToCommand(
                    buildSlashcommand('flipcoin: -v tails heads   draw', '123'),
                ),
            ).toBeNull();
        });

        test('Command without -v', () => {
            expect(
                adapter.slackCommandToCommand(
                    buildSlashcommand('flipcoin tails heads   draw', '123'),
                ),
            ).toBeNull();
            expect(adapter.slackCommandToCommand(buildSlashcommand('', '123'))).toBeNull();
        });
    });
});

describe('aliasListToSlackBlock', () => {
    test('Given a command list return a slack block list', () => {
        expect(
            adapter.aliasListToSlackBlock({
                otherAliases: [{ text: 'text1', values: ['1'], userId: 'abc' }],
                userAliases: [
                    { text: 'text2', values: ['2'], userId: '123' },
                    { text: 'text3', values: ['3', '4'], userId: '123' },
                ],
            }),
        ).toEqual<SectionBlock[]>([
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '*Your aliases:*\n:text2\n:text3',
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '\n*Others\' aliases:*\n:text1',
                },
            },
        ]);
    });
});
