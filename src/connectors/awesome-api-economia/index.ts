import type { Got } from 'got';
import got from 'got';
import { makeGetDailyDollarRate } from './operations/get-daily-dollar-rate';

export function makeAwesomeApiConnector() {
    const gotInstance: Got = got.extend({
        prefixUrl: 'https://economia.awesomeapi.com.br/json/',
        retry: 3,
    });

    return {
        getDailyDollarRate: makeGetDailyDollarRate({ gotInstance }),
    };
}