import { Test, TestingModule } from '@nestjs/testing';
import { EtiquetaAutomáticaController } from './etiqueta-automática.controller';
import { EtiquetaAutomáticaService } from './etiqueta-automática.service';

describe('EtiquetaAutomáticaController', () => {
  let controller: EtiquetaAutomáticaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EtiquetaAutomáticaController],
      providers: [EtiquetaAutomáticaService],
    }).compile();

    controller = module.get<EtiquetaAutomáticaController>(
      EtiquetaAutomáticaController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
