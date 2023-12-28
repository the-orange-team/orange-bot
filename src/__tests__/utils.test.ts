import axios from 'axios';
import * as utils from '../utils';
jest.mock('axios');

const axiosMock = jest.mocked(axios.get, { shallow: false });

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

describe('zip', () => {
    test('two arrays', () => {
        expect(utils.zip(['a', 'b', 'c'], ['1', '2', '3'])).toEqual([
            ['a', '1'],
            ['b', '2'],
            ['c', '3'],
        ]);
    });
});

test('groupByKey', () => {
    expect(
        utils.groupArrayByKey(
            [
                { a: '1', b: '2' },
                { a: '1', b: '3' },
                { a: '2', b: '4' },
            ],
            (val) => val.a
        )
    ).toEqual({
        '1': [
            { a: '1', b: '2' },
            { a: '1', b: '3' },
        ],
        '2': [{ a: '2', b: '4' }],
    });
});

test('remove extra spaces', () => {
    expect(utils.removeStringExtraSpaces('    some     string   \n   ')).toEqual('some string');
});
