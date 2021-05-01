import { App } from '@slack/bolt';
import { getValue, setValue } from './storage';

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

app.message('romulo', async ({ event, context, client, say }) => {
  try {
    await say("romulo tcholas kkk teste");
    console.log(await getValue("teste"));
  }
  catch (error) {
    console.error(error);
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
