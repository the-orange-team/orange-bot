import { makeGetFreeGames } from './get-free-games';
import nock from 'nock';
import got, { Got } from 'got';
import { OfferType, ResponseType } from '../entities/types';

describe('makeGetFreeGames', () => {
    const baseUrl = 'https://store-site-backend-static.ak.epicgames.com/';
    const requestURI = '/freeGamesPromotions';

    it('should fetch get list of free games', async () => {
        // Mocked data and dependencies
        const gotInstance: Got = got.extend({
            prefixUrl: baseUrl,
        });

        const getFreeGames = makeGetFreeGames({ gotInstance });

        const mockedResponse: ResponseType = {
            data: {
                Catalog: {
                    searchStore: {
                        elements: [
                            {
                                id: 'test-id',
                                title: 'Test Game',
                                description: 'This is a test game',
                                effectiveDate: '2021-01-01',
                                expiryDate: '2021-01-02',
                                offerType: OfferType.BASE_GAME,
                                keyImages: [
                                    {
                                        type: 'DieselStoreFrontWide',
                                        url: 'https://test.com/test.png',
                                    },
                                ],
                                price: {
                                    totalPrice: {
                                        discountPrice: 0,
                                    },
                                },
                                promotions: {
                                    promotionalOffers: [
                                        {
                                            promotionalOffers: [
                                                {
                                                    startDate: '2021-01-01',
                                                    endDate: '2021-01-02',
                                                    discountSetting: {
                                                        discountType: 'PERCENTAGE',
                                                        discountPercentage: 100,
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            },
        };

        // Set up the interceptor
        const scope = nock(baseUrl)
            .get(requestURI)
            .reply(200, mockedResponse);

        // Call the function
        const result = await getFreeGames();

        // Assertions
        expect(scope.isDone()).toBe(true);

        // Assert the returned data format and values
        expect(result).toEqual(mockedResponse.data.Catalog.searchStore.elements);
    });
});
