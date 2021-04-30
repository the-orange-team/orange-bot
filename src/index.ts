import { App } from '@slack/bolt';

const app = new App({
  token: process.env.SLACK_TOKEN, 
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

(async () => {
  const PORT = Number(process.env.PORT)
  await app.start( PORT || 3000);
  console.log(`⚡️ Bolt app started on port ${PORT}`);
})();

// subscribe to 'app_mention' event in your App config
// need app_mentions:read and chat:write scopes
app.message('romulo', async ({ event, context, client, say }) => {
  try {
    await say("romulo tcholas kkk teste");
  }
  catch (error) {
    console.error(error);
  }
});
