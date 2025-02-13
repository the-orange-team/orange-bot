import { makeEpicGamesConnector } from '../connectors/epic-games';
import { app } from '../app';
import { ElementType, OfferType } from '../connectors/epic-games/entities/types';
import { textWithImageToSlackMessage } from '../messages';
import { CronJob } from 'cron';

const TAG = 'free-epic-games';

async function getAvailableFreeGames() {
    const epicGamesConnector = makeEpicGamesConnector();
    const elements = await epicGamesConnector.getFreeGames();

    return elements.filter(({ offerType, price, promotions }) => {
        // Exclude ADD_ON types and ensure discount price is 0
        if (offerType === OfferType.ADD_ON || price.totalPrice.discountPrice !== 0) {
            return false;
        }

        // Check if there are active promotions
        return promotions.promotionalOffers.some(({ promotionalOffers }) =>
            promotionalOffers.some(({ startDate, endDate }) =>
                new Date(startDate) <= new Date() && new Date(endDate) >= new Date(),
            ),
        );
    });
}

app.command('/free-epic-games', async ({ ack, context, say, payload }) => {
    context.logStep(TAG, 'received');
    const freeGames = await getAvailableFreeGames();
    context.logStep(TAG, 'fetched');
    if (freeGames.length === 0) {
        await context.sendEphemeral('Não há jogos grátis no momento.');
        await ack();
    }
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
        cronTime: '0 14 * * 4',
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
        `Epic Store: epic.gm/freegames`;
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
