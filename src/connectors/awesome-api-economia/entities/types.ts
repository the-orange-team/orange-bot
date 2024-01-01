export type DailyDollarRateType = {
    buyingRate: number;
    sellingRate: number;
    dateTimeQuote: string;
}

export type ResponseType = {
    USDBRL: {
        bid: number;
        ask: number;
        create_date: string;
    }
}

export type ConfigurationType = {
    params: {
        currencies: 'USD-BRL' | 'EUR-BRL' | 'BTC-BRL';
    }
}