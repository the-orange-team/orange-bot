import { makeGetDailyDollarRate } from './get-daily-dollar-rate';
import nock, { disableNetConnect } from 'nock';
import got, { Got } from 'got';

beforeAll(() => {
    disableNetConnect();
});

const baseUrl = 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/';
const requestURI = '/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)';

describe('makeGetDailyDollarRate', () => {
    it('should fetch daily dollar rate for a specific date range', async () => {
        // Mocked data and dependencies
        const gotInstance: Got = got.extend({
            prefixUrl: baseUrl,
            retry: 0,
        });

        const configuration = {
            params: {
                date: new Date('2023-12-29'),
            },
        };

        const getDailyDollarRate = makeGetDailyDollarRate({ gotInstance });

        const mockedResponse = {
            value: [{
                cotacaoCompra: 666,
                cotacaoVenda: 666,
                dataHoraCotacao: '2023-12-28T15:30:00',
            }],
        };

        const scope = nock(baseUrl)
            .get(requestURI)
            .query(true)
            .reply(200, mockedResponse);

        // Call the function
        const result = await getDailyDollarRate({ configuration });

        // Assertions
        expect(scope.isDone()).toBe(true);

        // Assert the returned data format and values
        expect(result).toEqual([
            {
                buyingRate: 666,
                sellingRate: 666,
                dateTimeQuote: '2023-12-28T15:30:00',
            },
        ]);
    });
});
