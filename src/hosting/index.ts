import { Bucket } from '@google-cloud/storage';
import admin from 'firebase-admin';
import fs from 'fs';
import axios from 'axios';
import { AxiosResponse } from 'axios';
import { Alias } from '../messages/types';
import { URL } from 'url';
import path from 'path';

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
            const uploadedUrl = await this.uploadAliasValue(originalUrl, alias.text);
            uploadedValues.push(uploadedUrl);
        }
        return {
            text: alias.text,
            userId: alias.userId,
            values: uploadedValues,
        };
    }

    private async uploadAliasValue(originalUrl: string, aliasName: string): Promise<string> {
        const fileName = this.generateFileName(originalUrl, aliasName);
        const filePath = (await this.urlToFile(originalUrl, fileName)) as string;
        return filePath ? await this.uploadToFirebase(filePath) : originalUrl;
    }

    private async urlToFile(url: string, fileName: string): Promise<string | Buffer> {
        return axios({
            url,
            responseType: 'stream',
        }).then((response) => this.writeIntoFileSystem(response, fileName));
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
}

export const fileSystem = new FirebaseFileSystem();
