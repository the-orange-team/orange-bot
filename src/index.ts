import { App } from '@slack/bolt';
import { getValue, setValue } from './storage';
import Twitter from 'twitter'

const app = new App({
  token: process.env.SLACK_TOKEN, 
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

(async () => {
  const PORT = Number(process.env.PORT) || 3000
  await app.start(PORT);
  console.log(`⚡️ Bolt app started on port ${PORT}`);
})();

// subscribe to 'app_mention' event in your App config
// need app_mentions:read and chat:write scopes

app.message('getvalue', async ({ event, context, client, say }) => {
  try {
    await say("getting value");
    console.log(await getValue("teste"));
  }
  catch (error) {
    app.error(error);
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

