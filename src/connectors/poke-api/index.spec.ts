import { makePokeApiConnector } from './index';
import * as getPokemonByNumberModule from './operations/get-pokemon-by-number';
import { makeGetPokemonByNumber } from './operations/get-pokemon-by-number';
import got from 'got';


// Mock implementation for 'got' library
jest.mock('got', () => ({
    extend: jest.fn().mockReturnValue({
        get: jest.fn(),
    }),
}));

describe('makePokeApiConnector', () => {
    it('should create PokeAPI Connector with correct configurations', () => {
        // Mock the makeGetPokemonByNumber function
        const makeGetPokemonByNumberMock = jest.fn();
        jest.spyOn(getPokemonByNumberModule, 'makeGetPokemonByNumber').mockImplementation(makeGetPokemonByNumberMock);

        // Arrange
        const pokeApiConnector = makePokeApiConnector();

        // Assert
        expect(got.extend).toHaveBeenCalledWith({
            prefixUrl: 'https://pokeapi.co/api/v2/',
            retry: 3,
        });

        expect(pokeApiConnector).toHaveProperty('getPokemonByNumber');

        // Assuming makeGetPokemonByNumber is properly imported and mocked
        expect(makeGetPokemonByNumber).toHaveBeenCalledWith({
            gotInstance: expect.objectContaining({
                get: expect.any(Function),
            }),
        });
    });
});
