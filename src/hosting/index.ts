import { Bucket } from '@google-cloud/storage';
import admin from 'firebase-admin';
import fs from 'fs';
import axios from 'axios';
import { AxiosResponse } from 'axios';
import { Alias } from '../messages/types';
import { response } from 'express';

export interface FileSystem {
    uploadURL: (alias: Alias) => void;
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

    async uploadURL(alias: Alias): Promise<void> {
        const filePath = (await this.urlToFile(alias.values[0], alias.text)) as string;
        if (filePath) {
            const upload = await this.bucket.upload(filePath);
        }
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
}

export const fileSystem = new FirebaseFileSystem();
