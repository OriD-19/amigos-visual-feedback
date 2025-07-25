import { Test, TestingModule } from '@nestjs/testing';
import { ChatGptService } from './chatgpt.service';

// Mock the OpenAI module before importing the service
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    })),
  };
});

const mockOpenAIInstance = new (require('openai').default)();

describe('ChatGptService', () => {
  let service: ChatGptService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatGptService],
    }).compile();

    service = module.get<ChatGptService>(ChatGptService);
    // Overwrite the openai property with the mock instance
    // @ts-ignore
    service.openai = mockOpenAIInstance;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generarEtiqueta', () => {
    it('should return a string label', async () => {
      mockOpenAIInstance.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'fruta' } }],
      });
      const result = await service.generarEtiqueta('El producto es una banana');
      expect(result).toBe('fruta');
      expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalled();
    });
  });

  describe('generarSemaforoEmociones', () => {
    it('should return a string emotion', async () => {
      mockOpenAIInstance.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Verde' } }],
      });
      const result = await service.generarSemaforoEmociones('Me encantó el producto');
      expect(result).toBe('Verde');
      expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalled();
    });
  });
});
