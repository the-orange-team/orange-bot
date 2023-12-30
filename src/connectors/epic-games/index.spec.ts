import { makeEpicGamesConnector } from './index';
import * as getFreeGamesBuNumber from './operations/get-free-games';
import { makeGetFreeGames } from './operations/get-free-games';
import got from 'got';


// Mock implementation for 'got' library
jest.mock('got', () => ({
    extend: jest.fn().mockReturnValue({
        get: jest.fn(),
    }),
}));

describe('makeEpicGamesConnector', () => {
    it('should create Epic Games Connector with correct configurations', () => {
        // Mock the makeGetPokemonByNumber function
        const makeGetFreeGamesMock = jest.fn();
        jest.spyOn(getFreeGamesBuNumber, 'makeGetFreeGames').mockImplementation(makeGetFreeGamesMock);

        // Arrange
        const epicGamesConnector = makeEpicGamesConnector();

        // Assert
        expect(got.extend).toHaveBeenCalledWith({
            prefixUrl: 'https://store-site-backend-static.ak.epicgames.com/',
            retry: 3,
        });

        expect(epicGamesConnector).toHaveProperty('getFreeGames');

        // Assuming makeGetPokemonByNumber is properly imported and mocked
        expect(makeGetFreeGames).toHaveBeenCalledWith({
            gotInstance: expect.objectContaining({
                get: expect.any(Function),
            }),
        });
    });
});
