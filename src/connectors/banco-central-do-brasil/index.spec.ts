import { makeBCBConnector } from './index';
import * as getCurrentDollarRateModule from './operations/get-daily-dollar-rate';
import { makeGetDailyDollarRate } from './operations/get-daily-dollar-rate';
import got from 'got';

// Mock implementation for 'got' library
jest.mock('got', () => ({
    extend: jest.fn().mockReturnValue({
        get: jest.fn(),
    }),
}));

describe('makeBCBConnector', () => {
    it('should create BCB Connector with correct configurations', () => {
        // Mock the makeGetDailyDollarRate function
        const makeGetDailyDollarRateMock = jest.fn();
        jest.spyOn(getCurrentDollarRateModule, 'makeGetDailyDollarRate').mockImplementation(makeGetDailyDollarRateMock);

        // Arrange
        const bcbConnector = makeBCBConnector();

        // Assert
        expect(got.extend).toHaveBeenCalledWith({
            prefixUrl: 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata',
            retry: 3,
        });

        expect(bcbConnector).toHaveProperty('getDailyDollarRate');

        expect(makeGetDailyDollarRate).toHaveBeenCalledWith({
            gotInstance: expect.objectContaining({
                get: expect.any(Function),
            }),
        });
    });
});
