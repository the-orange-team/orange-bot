import * as alias from '../../messages/alias';
import { StorageMock } from '../../__mocks__/storage';

jest.mock('../../utils', () => ({
    ...jest.requireActual('../../utils'),
    getRandomElement: jest.fn().mockImplementation((arg: string[]) => arg[0]),
}));

let storageMock: StorageMock = new StorageMock();

beforeEach(() => {
    storageMock = new StorageMock();
    jest.clearAllMocks();
});

describe('getAliasResponse', () => {
    test('gettings an existing alias', async () => {
        storageMock.getValue.mockResolvedValueOnce({
            text: ':a',
            userId: 'b',
            values: ['test'],
        });
        await expect(alias.getAliasResponse(':a', storageMock)).resolves.toEqual('test');
    });

    test('gettings an alias from a key without comma', async () => {
        storageMock.getValue.mockResolvedValueOnce({
            text: ':a',
            userId: 'b',
            values: ['test'],
        });
        await expect(alias.getAliasResponse('a', storageMock)).resolves.toEqual('test');
        expect(storageMock.getValue).toBeCalledWith(':a');
    });

    test('getting a non existing alias', async () => {
        storageMock.getValue.mockResolvedValueOnce(null);
        await expect(alias.getAliasResponse(':a', storageMock)).resolves.toBeNull();
    });
});

describe('getAlias', () => {
    test('gettings an alias', async () => {
        storageMock.getValue.mockResolvedValueOnce({
            text: ':a',
            userId: 'b',
            values: ['test'],
        });
        await expect(alias.getAlias(':a', storageMock)).resolves.toEqual({
            text: ':a',
            userId: 'b',
            values: ['test'],
        });
        expect(storageMock.getValue).toBeCalledWith(':a');
    });
});

describe('createAlias', () => {
    test('creating an alias', async () => {
        await alias.createAlias(
            {
                text: ':a',
                userId: 'b',
                values: ['test'],
            },
            storageMock
        );
        expect(storageMock.setValue).toBeCalledWith(':a', {
            text: ':a',
            userId: 'b',
            values: ['test'],
        });
    });
    test('creating an alias without comma', async () => {
        await alias.createAlias(
            {
                text: 'a',
                userId: 'b',
                values: ['test'],
            },
            storageMock
        );
        expect(storageMock.setValue).toBeCalledWith(':a', {
            text: 'a',
            userId: 'b',
            values: ['test'],
        });
    });
});