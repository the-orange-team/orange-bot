export type DailyDollarRateType = {
    buyingRate: number;
    sellingRate: number;
    dateTimeQuote: string;
}

export type PokeApiResponseType = {
    id: number;
    species: {
        name: string;
    }
    sprites: PokemonSpritesType;
}

export type PokemonSpritesType = {
    front_default: string;
    other: {
        'official-artwork': {
            front_default: string;
        }
    }
}

export type ConfigurationType = {
    params: {
        pokemonNumber: number;
    }
}