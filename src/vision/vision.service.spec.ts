import { VisionService } from './vision.service';

jest.mock('@google-cloud/vision', () => {
  return {
    ImageAnnotatorClient: jest.fn().mockImplementation(() => ({
      annotateImage: jest.fn(),
    })),
  };
});

jest.mock('./supermarket-keywords', () => ({
  SUPERMARKET_KEYWORDS: ['banana', 'apple'],
}));

const mockLabels = [
  { description: 'banana' },
  { description: 'fruit' },
  { description: 'rotten' },
];
const mockSafeSearch = {
  adult: 'VERY_UNLIKELY',
  violence: 'UNLIKELY',
  racy: 'UNLIKELY',
  medical: 'UNLIKELY',
};

describe('VisionService', () => {
  let service: VisionService;
  let mockAnnotateImage: jest.Mock;

  beforeEach(() => {
    service = new VisionService();
    // @ts-ignore
    mockAnnotateImage = service.visionClient.annotateImage;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return ACCEPTED with matchedSupermarketKeywords and safeSearch', async () => {
    mockAnnotateImage.mockResolvedValueOnce([
      {
        labelAnnotations: mockLabels,
        safeSearchAnnotation: mockSafeSearch,
      },
    ]);
    const keywordsModule = require('./supermarket-keywords');
    keywordsModule.SUPERMARKET_KEYWORDS = ['banana', 'apple'];
    const result = await service.analyzeImageFromUrl('http://test.com/image.jpg');
    expect(result.status).toBe('ACCEPTED');
    expect(result.matchedSupermarketKeywords).toContain('banana');
    expect(result.safeSearch).toEqual(mockSafeSearch);
  });

  it('should return REJECTED if no supermarket keyword matches', async () => {
    mockAnnotateImage.mockResolvedValueOnce([
      {
        labelAnnotations: [{ description: 'car' }],
        safeSearchAnnotation: mockSafeSearch,
      },
    ]);
    const keywordsModule = require('./supermarket-keywords');
    keywordsModule.SUPERMARKET_KEYWORDS = ['banana', 'apple'];
    const result = await service.analyzeImageFromUrl('http://test.com/image.jpg');
    expect(result.status).toBe('REJECTED');
    expect(result.safeSearch).toEqual(mockSafeSearch);
    expect(result.message).toBe('Este producto no pertenece al supermercado');
  });
});
