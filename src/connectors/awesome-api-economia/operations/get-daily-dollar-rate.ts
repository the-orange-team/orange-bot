import type { Got } from 'got';
import { ConfigurationType, DailyDollarRateType, ResponseType } from '../entities/types';

export function makeGetDailyDollarRate({ gotInstance }: { gotInstance: Got }) {
    return async function getDailyDollarRate({ configurations }: {
        configurations: ConfigurationType
    }): Promise<DailyDollarRateType> {

        const { currencies } = configurations.params;
        const requestUri = `last/${currencies}`;
        const response = await gotInstance.get<ResponseType>(
            requestUri,
            {
                responseType: 'json',
            });
        const { USDBRL } = response.body;
        return {
            buyingRate: USDBRL.bid,
            sellingRate: USDBRL.ask,
            dateTimeQuote: USDBRL.create_date,
        };
    };
}