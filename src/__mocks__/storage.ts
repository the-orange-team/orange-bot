import { Alias } from '../messages';
import { OperationResult, Storage } from '../storage/types';
import { Maybe } from '../utils';
import { jest } from '@jest/globals';

export class StorageMock implements Storage<Alias> {
    deleteAllKeys = jest.fn<() => Promise<void>>();
    deleteValue = jest.fn<(key: string) => Promise<OperationResult>>();
    getAliasesByKeys = jest.fn<(keys: string[]) => Promise<Map<string, Alias>>>();
    getAllAliasesKeys = jest.fn<() => Promise<string[]>>();
    getAllKeys = jest.fn<() => Promise<string[]>>();
    getValue = jest.fn<(key: string) => Promise<Maybe<Alias>>>();
    setValue = jest.fn<(key: string, value: Alias) => Promise<Alias>>();
}
