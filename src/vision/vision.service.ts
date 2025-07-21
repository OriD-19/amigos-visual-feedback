import { Injectable } from "@nestjs/common";
import * as vision from '@google-cloud/vision';
import * as path from 'path';
import { SUPERMARKET_KEYWORDS } from "./supermarket-keywords";

@Injectable()
export class VisionService {
  private visionClient: vision.ImageAnnotatorClient;

  constructor() {
    const credentialsPath = process.env.GCP_CREDENTIALS_PATH;

    if (!credentialsPath) {
      throw new Error('GCP_CREDENTIALS_PATH no está definido en el archivo .env');
    }

    const keyPath = path.resolve(credentialsPath);
    this.visionClient = new vision.ImageAnnotatorClient({ keyFilename: keyPath });
  }

  async analyzeImageFromUrl(imageUrl: string) {
    const [result] = await this.visionClient.annotateImage({
      image: { source: { imageUri: imageUrl } },
      features: [
        { type: 'LABEL_DETECTION' },
        { type: 'OBJECT_LOCALIZATION' },
        { type: 'TEXT_DETECTION' },
        { type: 'IMAGE_PROPERTIES' },
      ],
    });

    const labels = result.labelAnnotations
      ?.map(label => label.description?.toLowerCase())
      .filter((desc): desc is string => typeof desc === 'string') || [];

    const matchedSupermarketKeywords = labels.filter(label =>
      SUPERMARKET_KEYWORDS.includes(label)
    );

    if (matchedSupermarketKeywords.length === 0) {
      return {
        imageUrl,
        status: "REJECTED",
        message: "Este producto no pertenece al supermercado",
      };
    }

    return {
      imageUrl,
      status: "ACCEPTED",
      matchedSupermarketKeywords,
      annotations: result,
    };
  }
}
