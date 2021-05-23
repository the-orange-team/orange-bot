import * as alias from '../../messages/alias';
import { Alias } from '../../messages';
import { StorageMock } from '../../__mocks__/storage';
import * as dev_user from '../../utils/dev-user';

jest.mock('../../utils', () => ({
    ...jest.requireActual('../../utils'),
    getRandomElement: jest.fn().mockImplementation((arg: string[]) => arg[0]),
}));

let storageMock: StorageMock = new StorageMock();

beforeEach(() => {
    storageMock = new StorageMock();
    jest.clearAllMocks();
});

describe('messageStartingWithColonRegex', () => {
    test('it should match a command with :', () => {
        const [result] = alias.wordStartingWithColonRegex.exec(':alias') ?? [];
        expect(result).toBe(':alias');
    });

    test('it should not match command ending with :', () => {
        const [result, ...rest] = alias.wordStartingWithColonRegex.exec(':alias-alias:') ?? [];
        expect(result).toBeUndefined();
        expect(rest).toHaveLength(0);
    });

    test('it should match command in the middle of a sentence', () => {
        const [result] = alias.wordStartingWithColonRegex.exec(':alias testing') ?? [];
        expect(result.trim()).toBe(':alias');
    });

    test('it should match command only the first command', () => {
        const [result] = alias.wordStartingWithColonRegex.exec('a :test a :test: test test') ?? [];
        expect(result).toBe(':test ');
    });

    test('it should match command with special latin letters', () => {
        const [result] = alias.wordStartingWithColonRegex.exec(':putaço') ?? [];
        expect(result).toBe(':putaço');
    });

    test('it should not match with links', () => {
        const [result, ...rest] = alias.wordStartingWithColonRegex.exec('https://www.youtube.com/watch?v=dQw4w9WgXcQ') ?? [];
        expect(result).toBeUndefined();
        expect(rest).toHaveLength(0);
    });
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
        await expect(alias.createAlias({ text: ':a', userId: 'b', values: ['test']}, storageMock)).resolves.toEqual({
            success: true,
        });

        expect(storageMock.setValue).toBeCalledWith(':a', {
            text: ':a',
            userId: 'b',
            values: ['test'],
        });
    });
    test('creating an alias without colon', async () => {
        await expect(alias.createAlias({ text: 'a', userId: 'b', values: ['test']}, storageMock)).resolves.toEqual({
            success: true,
        });
        expect(storageMock.setValue).toBeCalledWith(':a', {
            text: 'a',
            userId: 'b',
            values: ['test'],
        });
    });

    test('creating an alias from an invalid expression is not allowed', async () => {
        await expect(alias.createAlias({ text: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', userId: 'b', values: ['test']}, storageMock)).resolves.toEqual({
            error: 'Invalid alias', 
            success: false,
        });
        expect(storageMock.setValue).toBeCalledTimes(0);
    });
});

describe('deleteAlias', () => {

    beforeEach(() => {
        const spy = jest.spyOn(dev_user, 'userIsDev');
        spy.mockReturnValue(false);
    });
    
    test('delete an owned alias', async () => {
        const userId = 'b';
        storageMock.getValue.mockResolvedValueOnce({
            text: ':a',
            userId,
            values: ['test'],
        });
        storageMock.deleteValue.mockResolvedValue({
            success: true,
        });
        await expect(alias.deleteAlias({ text: ':a' }, userId, storageMock)).resolves.toEqual({
            success: true,
        });
        expect(storageMock.deleteValue).toBeCalledWith(':a');
    });
    test('delete an owned alias without comma', async () => {
        const userId = 'b';
        storageMock.getValue.mockResolvedValueOnce({
            text: 'a',
            userId,
            values: ['test'],
        });
        storageMock.deleteValue.mockResolvedValue({
            success: true,
        });
        await expect(alias.deleteAlias({ text: 'a' }, userId, storageMock)).resolves.toEqual({
            success: true,
        });
        expect(storageMock.deleteValue).toBeCalledWith(':a');
    });

    test('can not delete alias owned by someone else', async () => {
        const userId = 'b';
        storageMock.getValue.mockResolvedValueOnce({
            text: 'a',
            userId: 'c',
            values: ['test'],
        });
        storageMock.deleteValue.mockResolvedValue({
            success: true,
        });
        await expect(alias.deleteAlias({ text: 'a' }, userId, storageMock)).resolves.toEqual({
            error: 'You can only delete the aliases you created',
            success: false,
        });
        expect(storageMock.deleteValue).toBeCalledTimes(0);
    });

    test('delete alias owned by someone else if you are a dev user', async () => {
        const spy = jest.spyOn(dev_user, 'userIsDev');
        spy.mockReturnValue(true);
        
        const userId = 'b';
        storageMock.getValue.mockResolvedValueOnce({
            text: 'a',
            userId: 'c',
            values: ['test'],
        });
        storageMock.deleteValue.mockResolvedValue({
            success: true,
        });
        await expect(alias.deleteAlias({ text: 'a' }, userId, storageMock)).resolves.toEqual({
            success: true,
        });
        expect(storageMock.deleteValue).toBeCalledWith(':a');
    });

    test('can not delete alias that does not exist', async () => {
        const userId = 'b';
        storageMock.getValue.mockResolvedValueOnce(null);
        storageMock.deleteValue.mockResolvedValue({
            success: true,
        });
        await expect(alias.deleteAlias({ text: 'a' }, userId, storageMock)).resolves.toEqual({
            error: 'You can only delete the aliases you created',
            success: false,
        });
        expect(storageMock.deleteValue).toBeCalledTimes(0);
    });

    test('rethrow storage error', async () => {
        const userId = 'b';
        storageMock.getValue.mockResolvedValueOnce({
            text: 'a',
            userId,
            values: ['test'],
        });
        storageMock.deleteValue.mockResolvedValue({
            success: false,
            error: 'Error',
        });
        await expect(alias.deleteAlias({ text: 'a' }, userId, storageMock)).rejects.toEqual(
            new Error('Error')
        );
        expect(storageMock.deleteValue).toBeCalledWith(':a');
    });
});

describe('listAlias', () => {
    test('list seprated between user and others', async () => {
        const userId = '2';
        const aliasesKeys = [':a', ':b', ':c'];
        storageMock.getAllAliasesKeys.mockResolvedValue(aliasesKeys);
        storageMock.getAliasesByKeys.mockResolvedValue(
            new Map<string, Alias>([
                [':a', { text: 'a', userId, values: ['test'] }],
                [':b', { text: 'b', userId: '1', values: ['test2'] }],
                [':c', { text: 'c', userId, values: ['test3'] }],
            ])
        );
        await expect(alias.listAlias(userId, storageMock)).resolves.toEqual({
            userAliases: [
                { text: 'a', userId, values: ['test'] },
                { text: 'c', userId, values: ['test3'] },
            ],
            otherAliases: [{ text: 'b', userId: '1', values: ['test2'] }],
        });

        expect(storageMock.getAliasesByKeys).toBeCalledWith(aliasesKeys);
    });

    test('list aliases alphabetically', async () => {
        const userId = '2';
        const aliasesKeys = [':c', ':a', ':b'];
        storageMock.getAllAliasesKeys.mockResolvedValue(aliasesKeys);
        storageMock.getAliasesByKeys.mockResolvedValue(
            new Map<string, Alias>([
                [':c', { text: 'c', userId, values: ['test3'] }],
                [':a', { text: 'a', userId, values: ['test'] }],
                [':b', { text: 'b', userId: '1', values: ['test2'] }],
            ])
        );
        await expect(alias.listAlias(userId, storageMock)).resolves.toEqual({
            userAliases: [
                { text: 'a', userId, values: ['test'] },
                { text: 'c', userId, values: ['test3'] },
            ],
            otherAliases: [{ text: 'b', userId: '1', values: ['test2'] }],
        });

        expect(storageMock.getAliasesByKeys).toBeCalledWith(aliasesKeys);
    });

    test('list aliases alphabetically with empty user aliases', async () => {
        const userId = '3';
        const aliasesKeys = [':c', ':a', ':b'];
        storageMock.getAllAliasesKeys.mockResolvedValue(aliasesKeys);
        storageMock.getAliasesByKeys.mockResolvedValue(
            new Map<string, Alias>([
                [':c', { text: 'c', userId: '2', values: ['test3'] }],
                [':a', { text: 'a', userId: '2', values: ['test'] }],
                [':b', { text: 'b', userId: '1', values: ['test2'] }],
            ])
        );
        await expect(alias.listAlias(userId, storageMock)).resolves.toEqual({
            userAliases: [],
            otherAliases: [
                { text: 'a', userId: '2', values: ['test'] },
                { text: 'b', userId: '1', values: ['test2'] },
                { text: 'c', userId: '2', values: ['test3'] },
            ],
        });

        expect(storageMock.getAliasesByKeys).toBeCalledWith(aliasesKeys);
    });
});
