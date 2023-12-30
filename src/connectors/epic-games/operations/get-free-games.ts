import type { Got } from 'got';
import { ElementType, ResponseType } from '../entities/types';

export function makeGetFreeGames({ gotInstance }: { gotInstance: Got }) {
    return async function getFreeGames(): Promise<Array<ElementType>> {
        const { body }: {
            body: ResponseType
        } = await gotInstance.get('freeGamesPromotions', {
            responseType: 'json',
        });
        const { data: { Catalog: { searchStore: { elements } } } } = body;
        return elements;
    };
}