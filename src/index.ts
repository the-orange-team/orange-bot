import express from "express";
import { WebClient } from '@slack/web-api';

const web = new WebClient(process.env.SLACK_TOKEN);
const app = express();

app.use(express.json());
app.get("/rafaelTchola", async (request, response) => {
  await web.chat.postMessage({
    channel: "#testes-bot",
    text: "Romulo tchola.",
  })
  return response.status(200).json({ message: "full tchola" });
});
app.listen(3333);
