import { Injectable } from '@nestjs/common';
import * as vision from '@google-cloud/vision';
import { SUPERMARKET_KEYWORDS } from './supermarket-keywords';

@Injectable()
export class VisionService {
  private visionClient: vision.ImageAnnotatorClient;

  constructor() {
    const credentials = {
      type: process.env.GCP_TYPE,
      project_id: process.env.GCP_PROJECT_ID,
      private_key_id: process.env.GCP_PRIVATE_KEY_ID,
      private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GCP_CLIENT_EMAIL,
      client_id: process.env.GCP_CLIENT_ID,
      auth_uri: process.env.GCP_AUTH_URI,
      token_uri: process.env.GCP_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.GCP_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.GCP_CLIENT_CERT_URL,
    };

    this.visionClient = new vision.ImageAnnotatorClient({ credentials });
  }

  async analyzeImageFromUrl(imageUrl: string) {
    const [result] = await this.visionClient.annotateImage({
      image: { source: { imageUri: imageUrl } },
      features: [
        { type: 'LABEL_DETECTION' },
        { type: 'OBJECT_LOCALIZATION' },
        { type: 'TEXT_DETECTION' },
        { type: 'IMAGE_PROPERTIES' },
        { type: 'SAFE_SEARCH_DETECTION' },
      ],
    });

    const labels = result.labelAnnotations
      ?.map(label => label.description?.toLowerCase())
      .filter((desc): desc is string => typeof desc === 'string') || [];

    const matchedSupermarketKeywords = labels.filter(label =>
      SUPERMARKET_KEYWORDS.includes(label)
    );

    const safeSearch = result.safeSearchAnnotation;

    if (matchedSupermarketKeywords.length === 0) {
      return {
        imageUrl,
        status: 'REJECTED',
        message: 'Este producto no pertenece al supermercado',
        safeSearch,
      };
    }

    return {
      imageUrl,
      status: 'ACCEPTED',
      matchedSupermarketKeywords,
      annotations: result,
      safeSearch,
    };
  }
}
