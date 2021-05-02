import { App } from '@slack/bolt';
import { storage } from './storage';
import Twitter from 'twitter';
import { returnCommand, createCommand, messageStartingWithColonRegex } from './messages/messages';
import { textToSlackMessage, slackCommandToCommand } from './messages/slackAdapter';

const app = new App({
    token: process.env.SLACK_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
});

(async () => {
    const PORT = Number(process.env.PORT) || 3000;
    await app.start(PORT);
    console.log(`⚡️ Orange Bot started on port ${PORT}`);
})();

app.message(messageStartingWithColonRegex, async ({ context, say }) => {
    // RegExp matches are inside of context.matches
    try {
        const command = context.matches[0].toLowerCase();
        await say(`getting ${command}`);
        const value = await returnCommand(command, storage);
        await say(textToSlackMessage(command, value));
    } catch (error) {
        await say('command failed');
        app.error(error);
    }
});

app.command('/create', async ({ command, ack, say }) => {
    try {
        await ack();
        const botCommand = slackCommandToCommand(command.text);
        if (botCommand) {
            createCommand(botCommand, storage);
            await say(`You can now use the command writing :${botCommand.command}`);
        } else {
            await say('Invalid command pattern');
        }
    } catch (err) {
        await say('Something went wrong');
    }
});

app.message('pokedolar', async () => {
    const client = new Twitter({
        consumer_key: process.env.TWITTER_API_KEY ?? '',
        consumer_secret: process.env.TWITTER_API_SECRET_KEY ?? '',
        bearer_token: process.env.TWITTER_BEARER_TOKEN ?? '',
    });

    const params = { screen_name: 'PokeDolar', count: 1 };

    client.get('statuses/user_timeline', params, function (error, tweets) {
        if (!error) {
            console.log(tweets);
        }
    });
});
