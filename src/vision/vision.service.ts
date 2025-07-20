import { Injectable } from "@nestjs/common";
import * as vision from '@google-cloud/vision';
import * as path from 'path';

@Injectable()
export class VisionService {
  private visionClient: vision.ImageAnnotatorClient;

  constructor() {
    const keyPath = path.join(__dirname, '../../keys/gcp-credentials.json');
    this.visionClient = new vision.ImageAnnotatorClient({ keyFilename: keyPath });
  }

  async analyzeImageFromUrl(imageUrl: string) {
    const [result] = await this.visionClient.annotateImage({
      image: { source: { imageUri: imageUrl } },
      features: [
        { type: 'LABEL_DETECTION' },
        { type: 'FACE_DETECTION' },
        { type: 'OBJECT_LOCALIZATION' },
        { type: 'TEXT_DETECTION' },
        { type: 'IMAGE_PROPERTIES' },
      ],
    });

    return {
      imageUrl,
      annotations: result,
    };
  }
}
