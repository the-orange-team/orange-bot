import { makeEpicGamesConnector } from '../connectors/epic-games';
import { app } from '../app';
import { ElementType } from '../connectors/epic-games/entities/types';
import { textWithImageToSlackMessage } from '../messages';
import { CronJob } from 'cron';

const TAG = 'free-epic-games';

async function getAvailableFreeGames() {
    const epicGamesConnector = makeEpicGamesConnector();
    const freeGames = await epicGamesConnector.getFreeGames();
    return freeGames.filter((freeGame) => freeGame.expiryDate !== null);
}

app.command('/free-epic-games', async ({ ack, context, say, payload }) => {
    context.logStep(TAG, 'received');
    const freeGames = await getAvailableFreeGames();
    context.logStep(TAG, 'fetched');
    freeGames.map(async (freeGame) => {
        await say(textWithImageToSlackMessage({
            text: createFreeEpicGameMessage(freeGame),
            mediaUrl: extractGameCover(freeGame) ?? createFreeEpicGameMessage(freeGame),
            userName: payload.user_name,
        }));
        await ack();
    });
});

export async function scheduleFreeGamesJob() {
    CronJob.from({
        cronTime: '0 13 * * 4',
        onTick: async () => {
            const freeGames = await getAvailableFreeGames();
            freeGames.map((freeGame) => {
                app.client.chat.postMessage({
                    channel: '#gaming',
                    text: createFreeEpicGameMessage(freeGame),
                    attachments: [
                        {
                            title: freeGame.title,
                            image_url: extractGameCover(freeGame),
                        },
                    ],
                });
            });
        },
        start: true,
        timeZone: 'America/Sao_Paulo',
    });
}

function extractGameCover(game: ElementType): string | undefined {
    return game.keyImages.find((keyImage) => keyImage.type === 'DieselStoreFrontWide')?.url;
}

function createFreeEpicGameMessage(freeGame: ElementType) {
    return `Grátis: *${freeGame.title}* \n` +
        `Disponível de: *${new Date(freeGame.effectiveDate).toLocaleDateString('pt-BR')}* \n` +
        `Até: *${new Date(freeGame.expiryDate).toLocaleDateString('pt-BR')}* \n` +
        `Epic Store: https://epic.gm/freegames`;
}