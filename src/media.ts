import { app } from './index'
import { getValue, setValue } from './storage';

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

  app.message(/^:.*$/, async ({ context, say }) => {
    // RegExp matches are inside of context.matches
    const command = context.matches[0];
    try {
        await say(`getting ${command.text}`);
        let response = await getValue(command.text);
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

  app.command('/list', async ({ command, ack, say }) => {

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