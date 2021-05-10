import { Alias } from '../messages';
import { OperationResult, Storage } from '../storage/types';
import { Maybe } from '../utils';
import { jest } from '@jest/globals';

type setValueArg = string | Alias;

export class StorageMock implements Storage<Alias> {
    deleteAllKeys = jest.fn<Promise<void>, string[]>();
    deleteValue = jest.fn<Promise<OperationResult>, string[]>();
    getAliasesByKeys = jest.fn<Promise<Map<string, Alias>>, string[][]>();
    getAllAliasesKeys = jest.fn<Promise<string[]>, string[]>();
    getAllKeys = jest.fn<Promise<string[]>, string[]>();
    getValue = jest.fn<Promise<Maybe<Alias>>, string[]>();
    setValue = jest.fn<Promise<Alias>, setValueArg[]>();
}
