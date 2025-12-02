/**
 * Example: Cross-platform command using the new architecture.
 *
 * This file demonstrates how to create a command that works on both
 * Slack and Discord using the PlatformContext abstraction.
 */
import { PlatformContext, CommandHandler } from '../platforms/types';
import { makeAwesomeApiConnector } from '../connectors/awesome-api-economia';
import { makePokeApiConnector } from '../connectors/poke-api';
import { PokemonSpritesType } from '../connectors/poke-api/entities/types';
import { firstLetterToUpperCase } from '../utils/strings';

const TAG = 'pokedolar';

export type PokeDollarType = {
    currentDollarRate: number;
    pokemonSprite: string;
    pokemonName: string;
    pokemonNumber: number;
};

/**
 * Cross-platform pokedolar command handler.
 * Works on both Slack and Discord.
 */
export const pokedolarHandler: CommandHandler = async (ctx: PlatformContext) => {
    try {
        ctx.logStep(TAG, 'received');

        const pokeDollar = await getPokeDollar();
        ctx.logStep(TAG, 'fetched');

        const text = createPokeDollarMessage(pokeDollar);

        await ctx.sendMessage({
            text,
            markdown: text,
            image: {
                url: pokeDollar.pokemonSprite,
                alt: `Pokemon #${pokeDollar.pokemonNumber} - ${pokeDollar.pokemonName}`,
            },
        });

        await ctx.ack();
    } catch (err: any) {
        ctx.logError(err);
        await ctx.sendEphemeral({
            text: err.message || 'An error occurred while fetching the pokedolar.',
        });
    }
};

async function getPokeDollar(): Promise<PokeDollarType> {
    const currentDollarRate = await getCurrentDollarRate();
    if (!currentDollarRate) {
        throw new Error('Não foi possível obter a cotação do dólar.');
    }
    const number = extractPokemonNumberFromDollarRate(currentDollarRate.buyingRate);
    const pokemon = await getPokemonByNumber(number);
    const {
        id: pokemonNumber,
        species: { name: pokemonName },
        sprites,
    } = pokemon;
    const pokemonSprite = extractPokemonSpriteUrlFromPokemonName(sprites);
    return {
        currentDollarRate: currentDollarRate.buyingRate,
        pokemonSprite,
        pokemonName,
        pokemonNumber,
    };
}

async function getPokemonByNumber(pokemonNumber: number) {
    const pokeApiConnector = makePokeApiConnector();
    const result = await pokeApiConnector.getPokemonByNumber({
        configuration: {
            params: {
                pokemonNumber,
            },
        },
    });
    const { id, species, sprites } = result;
    return { id, species, sprites };
}

async function getCurrentDollarRate() {
    const awesomeApiConnector = makeAwesomeApiConnector();
    const result = await awesomeApiConnector.getDailyDollarRate({
        configurations: {
            params: {
                currencies: 'USD-BRL',
            },
        },
    });

    const { buyingRate, sellingRate, dateTimeQuote } = result;
    return { buyingRate, sellingRate, dateTimeQuote };
}

function extractPokemonNumberFromDollarRate(dollarRate: number) {
    return Number(dollarRate.toString().replace('.', '').substring(0, 3));
}

function extractPokemonSpriteUrlFromPokemonName(sprites: PokemonSpritesType) {
    const { front_default, other } = sprites;
    const {
        'official-artwork': { front_default: officialArtworkFrontDefault },
    } = other;
    return officialArtworkFrontDefault || front_default;
}

function createPokeDollarMessage({
    pokemonNumber,
    pokemonName,
    currentDollarRate,
}: Omit<PokeDollarType, 'pokemonSprite'>): string {
    return `O dólar está cotado a R$ ${currentDollarRate
        .toString()
        .substring(0, 4)
        .replace('.', ',')}.\n#${pokemonNumber} - ${firstLetterToUpperCase(pokemonName)}`;
}
