import { App } from '@slack/bolt';
import { getValue, setValue } from './storage';
import Twitter from 'twitter';
import { getRandomElement, isUrl } from './utils';

const app = new App({
    token: process.env.SLACK_TOKEN, 
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
});

(async () => {
    const PORT = Number(process.env.PORT) || 3000;
    await app.start(PORT);
    console.log(`⚡️ Bolt app started on port ${PORT}`);
})();

app.message('getvalue', async ({ event, context, client, say }) => {
    try {
        await say('getting value');
        console.log(await getValue('teste'));
    }
    catch (error) {
        app.error(error);
    }
});

app.message(/^:.*[^:]$/, async ({ context, say }) => {
    // RegExp matches are inside of context.matches
    const command = context.matches[0];
    try {
        await say(`getting ${command}`);
        const response = await getValue(command);
        if (response) { 
            const selectedResponse = response instanceof Array? getRandomElement(response) : response;

            if (isUrl(selectedResponse)){
                await say({
                    text: selectedResponse,
                    blocks: [{
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: selectedResponse,
                        },
                        accessory: {
                            type: 'image',
                            image_url: selectedResponse,
                            alt_text: selectedResponse,
                        }
                    }]
                });
            } else {
                await say(selectedResponse);
            }
        }
        else { 
            await say("command doesn't exist");
        }
    }
    catch (error) {
        await say('command failed');
        app.error(error);
    }
});

app.command('/create', async ({ command, ack, say }) => {
    try {
        const regex = /^(.*) returning (.*)$/;
        await ack();
        const args = regex.exec(command.text);
        if (args) {
            const [, commandName, values] = args; // ignoring full match (first element)
            const value = values.includes(' ')? values.split(' ') : values;
            await setValue(`:${commandName}`, value);
            await say(`You can now use the command writing :${commandName}`);
        } else {
            await say('Invalid command pattern');
        }
    } catch (err){
        await say('Something went wrong');
    }
});

app.command('/echo', async ({ command, ack, say }) => {
    try {
        await ack();
        await say(`${command.text}`);
        await setValue('test', command.text);
    } catch (err){
        await say('MANDA O TEXTO FDP');
    }
});

app.message('pokedolar', async () => {
  
    const client = new Twitter({
        consumer_key: process.env.TWITTER_API_KEY ?? '',
        consumer_secret: process.env.TWITTER_API_SECRET_KEY ?? '',
        bearer_token: process.env.TWITTER_BEARER_TOKEN ?? ''
    });

    const params = { screen_name: 'PokeDolar', count: 1 };

    client.get('statuses/user_timeline', params, function (error, tweets) {
        if (!error) {
            console.log(tweets);
        }
    });
});
