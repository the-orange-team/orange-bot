import { Bucket } from '@google-cloud/storage';
import admin from 'firebase-admin';

export interface FileSystem {
    uploadURL: (url: string, fileName: string) => Promise<string>;
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

    uploadURL(url: string, fileName: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            console.log(this.bucket.name);
            resolve('');
        });
    }
}

export const fileSystem = new FirebaseFileSystem();
