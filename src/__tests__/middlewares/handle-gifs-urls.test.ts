import { urlParser } from '../../middlewares/handle-gifs-urls';
import axios from 'axios';

jest.mock('axios');
const axiosMock = jest.mocked(axios.get, { shallow: false });

describe('handle-gifs-urls', () => {
    test('should return formated url for short links', async () => {
        axiosMock.mockResolvedValueOnce({
            request: {
                path: '9PIh0i0Qs3fiNL7PKf',
            },
            status: 200,
            statusText: 'ok',
            config: {},
        });
        const url = await urlParser('https://gph.is/g/EG79Mbn');
        expect(url).toEqual('https://media.giphy.com/media/9PIh0i0Qs3fiNL7PKf/giphy.gif');
    });
    test('should return formated url for giphy.com gifs', async () => {
        const url = await urlParser('https://giphy.com/gifs/horse-applause-clapping-8RxCFgu88jUbe');
        expect(url).toEqual('https://media.giphy.com/media/8RxCFgu88jUbe/giphy.gif');
    });
});
