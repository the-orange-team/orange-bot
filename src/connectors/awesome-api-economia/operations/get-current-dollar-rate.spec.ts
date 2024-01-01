import { makeGetDailyDollarRate } from './get-daily-dollar-rate';
import nock, { disableNetConnect } from 'nock';
import got, { Got } from 'got';
import { ConfigurationType } from '../entities/types';

beforeAll(() => {
    disableNetConnect();
});

const baseUrl = 'https://economia.awesomeapi.com.br/json/';
const requestURI = '/last/USD-BRL';

describe('makeGetDailyDollarRate', () => {
    it('should fetch daily dollar rate for a specific date range', async () => {
        // Mocked data and dependencies
        const gotInstance: Got = got.extend({
            prefixUrl: baseUrl,
            retry: 0,
        });

        const configurations: ConfigurationType = {
            params: {
                currencies: 'USD-BRL',
            },
        };

        const getDailyDollarRate = makeGetDailyDollarRate({ gotInstance });

        const mockedResponse = {
            USDBRL: {
                bid: 666,
                ask: 666,
                create_date: '2023-12-28T15:30:00',
            },
        };

        const scope = nock(baseUrl)
            .get(requestURI)
            .reply(200, mockedResponse);

        // Call the function
        const result = await getDailyDollarRate({ configurations });

        // Assertions
        expect(scope.isDone()).toBe(true);

        // Assert the returned data format and values
        expect(result).toEqual(
            {
                buyingRate: 666,
                sellingRate: 666,
                dateTimeQuote: '2023-12-28T15:30:00',
            },
        );
    });
});
