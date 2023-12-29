export type DailyDollarRateType = {
    buyingRate: number;
    sellingRate: number;
    dateTimeQuote: string;
}

export type ResponseType = {
    value: {
        cotacaoCompra: number;
        cotacaoVenda: number;
        dataHoraCotacao: string;
    }[]
}

export type ConfigurationType = {
    params: {
        date: Date;
    }
}