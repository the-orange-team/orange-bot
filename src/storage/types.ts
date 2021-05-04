import { Maybe } from '../utils';

export interface OperationResult {
    success: boolean;
    error?: string;
}

export interface Storage<T> {
    getValue: (key: string) => Promise<Maybe<T>>;
    setValue: (key: string, value: T) => Promise<T>;
    getAllKeys: () => Promise<string[]>;
    getAllAliasesKeys: () => Promise<string[]>;
    getAliasesByKeys: (keys: string[]) => Promise<Map<string, Maybe<T>>>;
    deleteAllKeys: () => Promise<void>;
    deleteValue: (key: string) => Promise<OperationResult>;
}
