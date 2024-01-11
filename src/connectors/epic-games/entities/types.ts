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
    expiryDate: string;
    keyImages: Array<{ type: string; url: string }>;
    id: string;
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

