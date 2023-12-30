import type { Got } from 'got';
import got from 'got';
import { makeGetFreeGames } from './operations/get-free-games';

export function makeEpicGamesConnector() {
    const gotInstance: Got = got.extend({
        prefixUrl: 'https://store-site-backend-static.ak.epicgames.com/',
        retry: 3,
    });

    return {
        getFreeGames: makeGetFreeGames({ gotInstance }),
    };
}