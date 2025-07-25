import { Test, TestingModule } from '@nestjs/testing';
import { EtiquetaAutomáticaController } from './etiqueta-automática.controller';
import { EtiquetaAutomáticaService } from './etiqueta-automática.service';
import { NotFoundException } from '@nestjs/common';

describe('EtiquetaAutomáticaController', () => {
  let controller: EtiquetaAutomáticaController;
  let service: EtiquetaAutomáticaService;
  const mockEtiquetaService = {
    createEtiqueta: jest.fn(),
    encontrarEtiqueta: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EtiquetaAutomáticaController],
      providers: [
        {
          provide: EtiquetaAutomáticaService,
          useValue: mockEtiquetaService,
        },
      ],
    }).compile();

    controller = module.get<EtiquetaAutomáticaController>(
      EtiquetaAutomáticaController,
    );
    service = module.get<EtiquetaAutomáticaService>(
      EtiquetaAutomáticaService,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

});
