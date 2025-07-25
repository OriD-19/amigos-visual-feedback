import { Test, TestingModule } from '@nestjs/testing';
import { EtiquetaAutomáticaService } from './etiqueta-automática.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EtiquetaAutomática } from './etiqueta-automática.entity';
import { Repository } from 'typeorm';

describe('EtiquetaAutomáticaService', () => {
  let service: EtiquetaAutomáticaService;
  let etiquetaRepo: Repository<EtiquetaAutomática>;

  const mockEtiqueta = { id: 1, nombre: 'fruta' };

  const mockEtiquetaRepository = {
    findOne: jest.fn().mockResolvedValue(mockEtiqueta),
    create: jest.fn().mockImplementation((data) => data),
    save: jest.fn().mockImplementation((data) => Promise.resolve({ ...data, id: 2 })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EtiquetaAutomáticaService,
        { provide: getRepositoryToken(EtiquetaAutomática), useValue: mockEtiquetaRepository },
      ],
    }).compile();

    service = module.get<EtiquetaAutomáticaService>(EtiquetaAutomáticaService);
    etiquetaRepo = module.get(getRepositoryToken(EtiquetaAutomática));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('encontrarEtiqueta', () => {
    it('should return an etiqueta by name', async () => {
      const result = await service.encontrarEtiqueta('fruta');
      expect(result).toEqual(mockEtiqueta);
      expect(etiquetaRepo.findOne).toHaveBeenCalledWith({ where: { nombre: 'fruta' } });
    });

    it('should create and return a new etiqueta if not found', async () => {
      (etiquetaRepo.findOne as jest.Mock).mockResolvedValueOnce(null);
      const result = await service.encontrarEtiqueta('no-existe');
      expect(result).toEqual({ nombre: 'no-existe', id: 2 });
      expect(etiquetaRepo.create).toHaveBeenCalledWith({ nombre: 'no-existe' });
      expect(etiquetaRepo.save).toHaveBeenCalled();
    });
  });
});
