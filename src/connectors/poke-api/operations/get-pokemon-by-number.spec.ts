import { makeGetPokemonByNumber } from './get-pokemon-by-number';
import nock from 'nock';
import got, { Got } from 'got';

describe('makeGetPokemonByNumber', () => {
    const baseUrl = 'https://pokeapi.co/api/v2/';
    const pokemonNumber = 25;

    it('should fetch Pokemon by number', async () => {
        // Mocked data and dependencies
        const gotInstance: Got = got.extend({
            prefixUrl: baseUrl,
        });

        const configuration = {
            params: {
                pokemonNumber,
            },
        };

        const makeGetPokemon = makeGetPokemonByNumber({ gotInstance });

        const mockedResponse = {
            id: 25,
            species: {
                name: 'pikachu',
                url: 'https://pokeapi.co/api/v2/pokemon-species/25/',
            },
            sprites: {
                front_default: 'https://pokeapi.co/api/v2/sprites/25/',
            },
            // Add more fields as per your actual response structure
        };

        // Set up the interceptor
        const scope = nock(baseUrl)
            .get(`/pokemon/${pokemonNumber}`)
            .reply(200, mockedResponse);

        // Call the function
        const result = await makeGetPokemon({ configuration });

        // Assertions
        expect(scope.isDone()).toBe(true);

        // Assert the returned data format and values
        expect(result).toEqual(mockedResponse);
    });
});
