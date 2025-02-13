export type ResponseType = {
    data: {
        Catalog: {
            searchStore: {
                elements: Array<ElementType>
            }
        };
    }
}

export type ElementType = {
    title: string;
    description: string;
    effectiveDate: string;
    offerType: OfferType;
    expiryDate: string;
    keyImages: Array<{ type: string; url: string }>;
    id: string;
    price: {
        totalPrice: {
            discountPrice: number;
        }
    }
    promotions: {
        promotionalOffers: Array<{
            promotionalOffers: Array<{
                startDate: string;
                endDate: string;
                discountSetting: {
                    discountType: string;
                    discountPercentage: number;
                };
            }>;
        }>;
    }
}

export enum OfferType {
    BASE_GAME = 'BASE_GAME',
    BUNDLE = 'BUNDLE',
    ADD_ON = 'ADD_ON',
}

