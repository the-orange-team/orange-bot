import { makeAwesomeApiConnector } from './index';
import * as getCurrentDollarRateModule from './operations/get-daily-dollar-rate';
import { makeGetDailyDollarRate } from './operations/get-daily-dollar-rate';
import got from 'got';

// Mock implementation for 'got' library
jest.mock('got', () => ({
    extend: jest.fn().mockReturnValue({
        get: jest.fn(),
    }),
}));

describe('makeAwesomeApiConnector', () => {
    it('should create Awesome Api Connector with correct configurations', () => {
        // Mock the makeGetDailyDollarRate function
        const makeGetDailyDollarRateMock = jest.fn();
        jest.spyOn(getCurrentDollarRateModule, 'makeGetDailyDollarRate').mockImplementation(makeGetDailyDollarRateMock);

        // Arrange
        const awesomeApiConnector = makeAwesomeApiConnector();

        // Assert
        expect(got.extend).toHaveBeenCalledWith({
            prefixUrl: 'https://economia.awesomeapi.com.br/json/',
            retry: 3,
        });

        expect(awesomeApiConnector).toHaveProperty('getDailyDollarRate');

        expect(makeGetDailyDollarRate).toHaveBeenCalledWith({
            gotInstance: expect.objectContaining({
                get: expect.any(Function),
            }),
        });
    });
});
