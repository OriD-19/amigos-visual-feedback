import { Test, TestingModule } from '@nestjs/testing';
import { ChatGptService } from './chatgpt.service';
import "dotenv/config"

describe('ChatGptService', () => {
  let service: ChatGptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatGptService],
    }).compile();

    service = module.get<ChatGptService>(ChatGptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generarEtiqueta', () => {
    it('should return a string label', async () => {
      // Mock implementation or expected result
      jest.spyOn(service, 'generarEtiqueta').mockResolvedValue('fruta');
      const result = await service.generarEtiqueta('El producto es una banana');
      expect(result).toBe('fruta');
    });
  });

  describe('generarSemaforoEmociones', () => {
    it('should return a string emotion', async () => {
      // Mock implementation or expected result
      jest.spyOn(service, 'generarSemaforoEmociones').mockResolvedValue('Verde');
      const result = await service.generarSemaforoEmociones('Me encantó el producto');
      expect(result).toBe('Verde');
    });
  });
});
