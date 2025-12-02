/**
 * Cross-platform free Epic Games command handler.
 */
import { CommandHandler, PlatformContext, UnifiedMessage } from '../platforms/types';
import { makeEpicGamesConnector } from '../connectors/epic-games';
import { ElementType, OfferType } from '../connectors/epic-games/entities/types';

const TAG = 'free-epic-games';

async function getAvailableFreeGames(): Promise<ElementType[]> {
    const epicGamesConnector = makeEpicGamesConnector();
    const elements = await epicGamesConnector.getFreeGames();

    return elements.filter(({ offerType, price, promotions }) => {
        // Exclude ADD_ON types and ensure discount price is 0
        if (offerType === OfferType.ADD_ON || price.totalPrice.discountPrice !== 0) {
            return false;
        }

        // Check if there are active promotions
        return promotions.promotionalOffers.some(({ promotionalOffers }) =>
            promotionalOffers.some(
                ({ startDate, endDate }) =>
                    new Date(startDate) <= new Date() && new Date(endDate) >= new Date()
            )
        );
    });
}

function extractGameCover(game: ElementType): string | undefined {
    return game.keyImages.find(
        (keyImage) =>
            keyImage.type === 'DieselStoreFrontWide' ||
            keyImage.type === 'OfferImageWide' ||
            keyImage.type === 'OfferImageTall' ||
            keyImage.type === 'Thumbnail'
    )?.url;
}

function getCurrentOffer(freeGame: ElementType) {
    const currentDate = new Date();
    return freeGame.promotions.promotionalOffers
        .flatMap((group) => group.promotionalOffers)
        .find((offer) => {
            const startDate = new Date(offer.startDate);
            const endDate = new Date(offer.endDate);
            return currentDate >= startDate && currentDate <= endDate;
        });
}

function createFreeEpicGameMessage(freeGame: ElementType): string {
    const currentOffer = getCurrentOffer(freeGame);
    return (
        `**${freeGame.title}**\n` +
        `${freeGame.description}\n` +
        `Disponível de: **${new Date(currentOffer!.startDate).toLocaleDateString('pt-BR')}**\n` +
        `Até: **${new Date(currentOffer!.endDate).toLocaleDateString('pt-BR')}**\n` +
        `Epic Store: epic.gm/freegames`
    );
}

export const freeEpicGamesHandler: CommandHandler = async (ctx: PlatformContext) => {
    try {
        ctx.logStep(TAG, 'received');

        const freeGames = await getAvailableFreeGames();
        ctx.logStep(TAG, 'fetched');

        if (freeGames.length === 0) {
            await ctx.sendEphemeral({
                text: 'Não há jogos grátis no momento.',
            });
            return;
        }

        // Send each game as a separate message
        for (const freeGame of freeGames) {
            const text = createFreeEpicGameMessage(freeGame);
            const cover = extractGameCover(freeGame);

            const message: UnifiedMessage = {
                text,
                markdown: text,
            };

            if (cover) {
                message.image = {
                    url: cover,
                    alt: freeGame.title,
                };
            }

            await ctx.sendMessage(message);
        }
    } catch (err: any) {
        ctx.logError(err);
        await ctx.sendEphemeral({
            text: `Algo deu errado: ${err.message}`,
        });
    }
};
