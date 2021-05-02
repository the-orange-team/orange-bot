import { App } from '@slack/bolt';
import { getValue, setValue } from './storage';
import Twitter from 'twitter'

export const app = new App({
  token: process.env.SLACK_TOKEN, 
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

(async () => {
  const PORT = Number(process.env.PORT) || 3000
  await app.start(PORT);
  console.log(`⚡️ Bolt app started on port ${PORT}`);
})();

app.message('getvalue', async ({ event, context, client, say }) => {
  try {
    await say("getting value");
    console.log(await getValue("teste"));
  }
  catch (error) {
    app.error(error);
  }
});

app.message(/^:.*$/, async ({ context, say }) => {
  // RegExp matches are inside of context.matches
  const command = context.matches[0];
  try {
      await say(`getting ${command.text}`);
      const response = await getValue(command.text);
      if(response) { await say(response.toString()) }
      else { await say("command doesn't exist") }
    }
    catch (error) {
      await say("command failed");
      app.error(error);
    }
});

app.command('/add', async ({ command, ack, say }) => {
  try{
      await ack();
      await setValue(`:${command.text}`, command.text);
    } catch(err){
      await say("MANDA O TEXTO FDP");
    }
});

app.command('/echo', async ({ command, ack, say }) => {
  try{
    await ack();
    await say(`${command.text}`);
    await setValue("test", command.text);
  } catch(err){
    await say("MANDA O TEXTO FDP");
  }
});

app.message('pokedolar', async () => {
  
  const client = new Twitter({
    consumer_key: process.env.TWITTER_API_KEY ?? '',
    consumer_secret: process.env.TWITTER_API_SECRET_KEY ?? '',
    bearer_token: process.env.TWITTER_BEARER_TOKEN ?? ''
  });

  const params = {screen_name: 'PokeDolar', count: 1};

  client.get('statuses/user_timeline', params, function(error, tweets) {
    if (!error) {
      console.log(tweets);
    }
  });
});
