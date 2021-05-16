import { urlParser } from '../middlewares/handle-gifs-urls';
import { Bucket } from '@google-cloud/storage';
import { validMediaTypes } from '../utils';
import { Alias } from '../messages';
import { AxiosResponse } from 'axios';
import { isUrl } from '../utils';
import { URL } from 'url';
import admin from 'firebase-admin';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { FIREBASE_BUCKET_ADDRESS } from '../utils/constants';

export interface FileSystem {
    uploadAlias: (alias: Alias) => Promise<Alias>;
}

class FirebaseFileSystem implements FileSystem {
    private bucket: Bucket;

    constructor() {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
            storageBucket: process.env.FIREBASE_STORAGE_URL,
        });
        this.bucket = admin.storage().bucket();
    }

    async uploadAlias(alias: Alias): Promise<Alias> {
        const uploadedValues: string[] = [];
        for (const originalUrl of alias.values) {
            const uploadedUrl = await this.handleAliasValue(originalUrl, alias.text);
            uploadedValues.push(uploadedUrl);
        }
        return {
            text: alias.text,
            userId: alias.userId,
            values: uploadedValues,
        };
    }

    private async handleAliasValue(originalUrl: string, aliasName: string): Promise<string> {
        const isFirebaseURL = this.checkForFirebaseURL(originalUrl);
        const stillExists = await this.checkForStoredURL(originalUrl);
        const doesntExistAnymore = isFirebaseURL && !stillExists;
        const isStoredAtFirebase = isFirebaseURL && stillExists;

        if (doesntExistAnymore) {
            throw InvalidAliasError.fromInvalidUrl(originalUrl);
        }

        return isStoredAtFirebase ? originalUrl : await this.handleValidURL(originalUrl, aliasName);
    }

    private async handleValidURL(originalUrl: string, aliasName: string): Promise<string> {
        if (isUrl(originalUrl)) {
            const parsedUrl = await urlParser(originalUrl);
            return this.safelyUploadUrl(parsedUrl, aliasName);
        } else {
            return originalUrl;
        }
    }

    private async safelyUploadUrl(originalUrl: string, aliasName: string): Promise<string> {
        try {
            const fileName = this.generateFileName(originalUrl, aliasName);
            const filePath = await this.urlToFile(originalUrl, fileName);
            return filePath ? await this.uploadToFirebase(filePath) : originalUrl;
        } catch (error) {
            return originalUrl;
        }
    }

    private async urlToFile(url: string, fileName: string): Promise<string> {
        return axios({
            url,
            responseType: 'stream',
        }).then((response) => this.handleUrlResponse(url, response, fileName));
    }

    private async handleUrlResponse(
        url: string,
        response: AxiosResponse,
        fileName: string
    ): Promise<string> {
        if (validMediaTypes.includes(response.headers['content-type'])) {
            return (await this.writeIntoFileSystem(response, fileName)) as string;
        } else {
            return url;
        }
    }

    private writeIntoFileSystem(
        response: AxiosResponse,
        fileName: string
    ): Promise<string | Buffer> {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(fileName);
            response.data
                .pipe(file)
                .on('close', () => {
                    resolve(file.path);
                })
                .on('error', (err: Error) => {
                    reject(err);
                });
        });
    }

    private async uploadToFirebase(filePath: string): Promise<string> {
        const upload = await this.bucket.upload(filePath);
        await upload[0].makePublic();
        return upload[0].publicUrl();
    }

    private generateFileName(url: string, aliasName: string): string {
        const contentUrl = new URL(url);
        const randomNumber = Math.floor(Math.random() * 1000);
        return `${aliasName}${randomNumber}${path.basename(contentUrl.pathname)}`;
    }

    private async checkForStoredURL(originalUrl: string): Promise<boolean> {
        const storageFile = this.bucket.file(this.getFilePath(originalUrl));
        try {
            const [fileExists] = await storageFile.exists();
            return fileExists;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    private checkForFirebaseURL(originalUrl: string): boolean {
        if (originalUrl.includes(FIREBASE_BUCKET_ADDRESS)) return true;
        return false;
    }

    private getFilePath(originalUrl: string): string {
        return originalUrl.replace(FIREBASE_BUCKET_ADDRESS, '');
    }
}

export const fileSystem = new FirebaseFileSystem();

export class InvalidAliasError extends Error {
    public url?: string;

    constructor(err: string) {
        super(err);
        Object.setPrototypeOf(this, InvalidAliasError.prototype);
    }

    public static fromInvalidUrl(url: string): InvalidAliasError {
        const error = new InvalidAliasError(`The URL ${url} doesn't exist`);
        error.url = url;
        return error;
    }
}
