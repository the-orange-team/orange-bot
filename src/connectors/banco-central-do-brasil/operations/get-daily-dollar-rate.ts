import type { Got } from 'got';
import { ConfigurationType, DailyDollarRateType, ResponseType } from '../entities/types';

export function makeGetDailyDollarRate({ gotInstance }: { gotInstance: Got }) {
    return async function getDailyDollarRate({ configuration }: {
        configuration: ConfigurationType
    }): Promise<DailyDollarRateType[]> {
        const { date } = configuration.params;

        const today = date.toLocaleDateString('en-US');
        const yesterday = new Date(date.setDate(date.getDate() - 1)).toLocaleDateString('en-US');

        const requestUri = 'CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)';

        const response = await gotInstance.get<ResponseType>(
            requestUri,
            {
                responseType: 'json',
                searchParams: {
                    $format: 'json',
                    '@dataInicial': yesterday,
                    '@dataFinalCotacao': today,
                },
            });
        const { value } = response.body;
        return value.map((item) => {
            return {
                buyingRate: item.cotacaoCompra,
                sellingRate: item.cotacaoVenda,
                dateTimeQuote: item.dataHoraCotacao,
            };
        });
    };
}