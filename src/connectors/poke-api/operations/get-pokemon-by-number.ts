import type { Got } from 'got';
import { ConfigurationType, PokeApiResponseType } from '../entities/types';

export function makeGetPokemonByNumber({ gotInstance }: { gotInstance: Got }) {
    return async function getPokemonByNumber({ configuration }: {
        configuration: ConfigurationType
    }): Promise<PokeApiResponseType> {
        const { pokemonNumber } = configuration.params;
        const { body }: {
            body: PokeApiResponseType
        } = await gotInstance.get(`pokemon/${pokemonNumber}`, {
            responseType: 'json',
        });
        const { id, species, sprites } = body;
        return { id, species, sprites };
    };
}