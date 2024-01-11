import { makeEpicGamesConnector } from '../connectors/epic-games';
import { app } from '../app';
import { ElementType } from '../connectors/epic-games/entities/types';
import { textWithImageToSlackMessage } from '../messages';
import { CronJob } from 'cron';

const TAG = 'free-epic-games';

async function getAvailableFreeGames() {
    const epicGamesConnector = makeEpicGamesConnector();
    const freeGames = await epicGamesConnector.getFreeGames();
    // get the free games available today
    return freeGames.filter((freeGame) =>
        freeGame.promotions.promotionalOffers.filter((promotionalOffer) =>
            promotionalOffer.promotionalOffers.filter((promotionalOffer) =>
                new Date(promotionalOffer.startDate) <= new Date() &&
                new Date(promotionalOffer.endDate) >= new Date(),
            ).length > 0,
        ).length > 0,
    );
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
    await context.sendEphemeral('Não há jogos grátis no momento.');
    await ack();
});

export async function scheduleFreeGamesJob() {
    CronJob.from({
        cronTime: '0 13 * * 4',
        onTick: async () => {
            const freeGames = await getAvailableFreeGames();
            if (freeGames.length === 0) {
                app.client.chat.postMessage({
                    channel: '#gaming',
                    text: 'Não há jogos grátis no momento.',
                });
            }
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
    return game.keyImages.find((keyImage) =>
        keyImage.type === 'DieselStoreFrontWide' ||
        keyImage.type === 'OfferImageWide' ||
        keyImage.type === 'OfferImageTall' ||
        keyImage.type === 'Thumbnail',
    )?.url;
}

function createFreeEpicGameMessage(freeGame: ElementType) {
    const currentOffer = getCurrentOffer(freeGame);
    return `*${freeGame.title}*\n` +
        `${freeGame.description}\n` +
        `Disponível de: *${new Date(currentOffer!.startDate).toLocaleDateString('pt-BR')}* \n` +
        `Até: *${new Date(currentOffer!.endDate).toLocaleDateString('pt-BR')}* \n` +
        `Epic Store: https://epic.gm/freegames`;
}

function getCurrentOffer(freeGame: ElementType) {
    const currentDate = new Date();
    return freeGame.promotions.promotionalOffers
        .flatMap(group => group.promotionalOffers)
        .find(offer => {
            const startDate = new Date(offer.startDate);
            const endDate = new Date(offer.endDate);
            return currentDate >= startDate && currentDate <= endDate;
        });
}
