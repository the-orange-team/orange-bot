import type { Got } from 'got';
import got from 'got';
import { makeGetDailyDollarRate } from './operations/get-daily-dollar-rate';

export function makeBCBConnector() {
    const gotInstance: Got = got.extend({
        prefixUrl: 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata',
        retry: 3,
    });

    return {
        getDailyDollarRate: makeGetDailyDollarRate({ gotInstance }),
    };
}