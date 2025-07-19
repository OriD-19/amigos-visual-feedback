import { Injectable } from "@nestjs/common";
import * as vision from '@google-cloud/vision';
import * as path from 'path';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

@Injectable()
export class VisionService {
    private storage: Storage;
    private visionClient: vision.ImageAnnotatorClient;
    private readonly bucketName: 'feedback-images-supermercado';

    constructor() {
        this.storage = new Storage
            ({
                keyFilename: path.join(__dirname, '../../keys/gcp-credentials.json'),
            });

        this.visionClient = new vision.ImageAnnotatorClient
            ({
                keyFilename: path.join(__dirname, '../../keys/gcp-credentials.json'),
            });
    }

    async uploadImageAndAnalyze(file: Express.Multer.File) {
        const filename = `${uuidv4()}-${file.originalname}`;
        const bucket = this.storage.bucket(this.bucketName);

        //Donde se sube la imagen al bucket
        const blob = bucket.file(filename);
        const blobStream = blob.createWriteStream
            ({
                resumable: false,
                metadata: { contentType: file.mimetype, },
            });

        await new Promise((resolve, reject) => {
            blobStream.on('error', reject);
            blobStream.on('finish', resolve);
            blobStream.end(file.buffer);
        });

        const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${filename}`;

        const [result] = await this.visionClient.annotateImage
            ({
                image: { source: { imageUri: publicUrl } },
                features: [
                    { type: 'LABEL_DETECTION' },
                    { type: 'FACE_DETECTION' },
                    { type: 'OBJECT_LOCALIZATION' },
                    { type: 'TEXT_DETECTION' },
                    { type: 'IMAGE_PROPERTIES' },
                ]
            });

        return{
            imageUrl: publicUrl,
            annotations: result,
        }
    }
}