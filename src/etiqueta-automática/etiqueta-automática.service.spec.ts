import { Test, TestingModule } from '@nestjs/testing';
import { EtiquetaAutomáticaService } from './etiqueta-automática.service';

describe('EtiquetaAutomáticaService', () => {
  let service: EtiquetaAutomáticaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EtiquetaAutomáticaService],
    }).compile();

    service = module.get<EtiquetaAutomáticaService>(EtiquetaAutomáticaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
