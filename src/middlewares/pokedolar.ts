import { app } from '../app';
import { textWithImageToSlackMessage } from '../messages';
import { callAuthorized } from './user-auth';

import { makeBCBConnector } from '../connectors/banco-central-do-brasil';
import { makePokeApiConnector } from '../connectors/poke-api';
import { PokemonSpritesType } from '../connectors/poke-api/entities/types';
import { firstLetterToUpperCase } from '../utils/strings';

const TAG = 'pokedolar';

export type PokeDollarType = {
    currentDollarRate: number;
    pokemonSprite: string;
    pokemonName: string;
    pokemonNumber: number;
}

app.command('/pokedolar', callAuthorized, async ({ say, ack, context, payload }) => {
    try {
        context.logStep(TAG, 'received');
        const { pokemonNumber, pokemonSprite, pokemonName, currentDollarRate } = await getPokeDollar();
        context.logStep(TAG, 'fetched');
        const text = createPokeDollarMessage({ pokemonNumber, pokemonName, currentDollarRate });
        await say(textWithImageToSlackMessage({ text, mediaUrl: pokemonSprite, userName: payload.user_name }));
        await ack();
    } catch (err: any) {
        await say(err.message);
        context.logError(err);
    }
});

export async function getPokeDollar(): Promise<PokeDollarType> {
    const currentDollarRate = await getCurrentDollarRate();
    if (!currentDollarRate) {
        throw new Error('Não foi possível obter a cotação do dólar.');
    }
    const number = extractPokemonNumberFromDollarRate(currentDollarRate.buyingRate);
    const pokemon = await getPokemonByNumber(number);
    const { id: pokemonNumber, species: { name: pokemonName }, sprites } = pokemon;
    const pokemonSprite = extractPokemonSpriteUrlFromPokemonName(sprites);
    return { currentDollarRate: currentDollarRate.buyingRate, pokemonSprite, pokemonName, pokemonNumber };
}

async function getPokemonByNumber(pokemonNumber: number) {
    const pokeApiConnector = makePokeApiConnector();
    const result = await pokeApiConnector.getPokemonByNumber({
            configuration: {
                params: {
                    pokemonNumber,
                },
            },
        },
    );
    const { id, species, sprites } = result;
    return { id, species, sprites };
}

async function getCurrentDollarRate() {
    const today = new Date();
    const bcbConnector = makeBCBConnector();
    const results = await bcbConnector.getDailyDollarRate({
            configuration: {
                params: {
                    date: today,
                },
            },
        },
    );

    const latestResult = results.pop();

    if (!latestResult) {
        return undefined;
    }

    const { buyingRate, sellingRate, dateTimeQuote } = latestResult;
    return { buyingRate, sellingRate, dateTimeQuote };
}

function extractPokemonNumberFromDollarRate(dollarRate: number) {
    return Number((dollarRate.toString().replace('.', '').substring(0, 3)));
}

function extractPokemonSpriteUrlFromPokemonName(sprites: PokemonSpritesType) {
    const { front_default, other } = sprites;
    const { 'official-artwork': { front_default: officialArtworkFrontDefault } } = other;
    return officialArtworkFrontDefault || front_default;
}

function createPokeDollarMessage(
    {
        pokemonNumber,
        pokemonName,
        currentDollarRate,
    }: Omit<PokeDollarType, 'pokemonSprite'>) {
    return `O dólar está cotado a R$ ${currentDollarRate.toString().substring(0, 4).replace('.', ',')}.\n #${pokemonNumber} - ${firstLetterToUpperCase(pokemonName)}`;
}

