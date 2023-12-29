import type { Got } from 'got';
import got from 'got';
import { makeGetPokemonByNumber } from './operations/get-pokemon-by-number';

export function makePokeApiConnector() {
    const gotInstance: Got = got.extend({
        prefixUrl: 'https://pokeapi.co/api/v2/',
        retry: 3,
    });

    return {
        getPokemonByNumber: makeGetPokemonByNumber({ gotInstance }),
    };
}