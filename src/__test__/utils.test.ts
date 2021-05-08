import axios from 'axios';
import { mocked } from 'ts-jest/utils';
import * as utils from '../utils';
jest.mock('axios');

const axiosMock = mocked(axios.get, true);

describe('isUrl', () => {
    test('given a url', () => {
        expect(utils.isUrl('http://bla.com'));
        expect(utils.isUrl('https://bla.com'));
    });
    test('given somethings else', () => {
        expect(utils.isUrl('bla.com'));
    });
});

describe('isMediaUrl', () => {
    test('given a value that is not a url', async () => {
        expect.assertions(1);
        await expect(utils.isMediaUrl('some text')).resolves.toEqual(false);
    });
    test('given a media type url', async () => {
        axiosMock.mockResolvedValueOnce({
            data: null,
            status: 200,
            statusText: 'ok',
            headers: { 'content-type': 'image/gif' },
            config: {},
        });
        expect.assertions(1);
        await expect(
            utils.isMediaUrl('https://media.giphy.com/media/ZxomYqy9uGtSQSSjth/giphy.gif')
        ).resolves.toEqual(true);
    });
    test('given a text type url', async () => {
        axiosMock.mockResolvedValueOnce({
            data: null,
            status: 200,
            statusText: 'ok',
            headers: { 'content-type': 'html/text' },
            config: {},
        });
        expect.assertions(1);
        await expect(
            utils.isMediaUrl('https://media.giphy.com/media/ZxomYqy9uGtSQSSjth/giphy.gif')
        ).resolves.toEqual(false);
    });
    test('given a error hapens', async () => {
        axiosMock.mockRejectedValue({
            status: 404,
            statusText: 'not found',
            headers: { 'content-type': 'image/gif' },
            config: {},
        });
        expect.assertions(1);
        await expect(
            utils.isMediaUrl('https://media.giphy.com/media/ZxomYqy9uGtSQSSjth/giphy.gif')
        ).resolves.toEqual(false);
    });
});
