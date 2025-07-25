import { Test, TestingModule } from '@nestjs/testing';
import { ComentarioService } from './comentario.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comentario } from './comentario.entity';
import { Repository } from 'typeorm';
import { ChatGptService } from '../chatgpt/chatgpt.service';
import { EtiquetaAutomáticaService } from '../etiqueta-automática/etiqueta-automática.service';
import { VisionService } from '../vision/vision.service';
import { ProductsService } from '../products/products.service';
import { Image } from './image.entity';
import { Feedback } from './feedback.entity';

const mockComentario = {
  id: 1,
  textoComentario: 'Great product',
  sentimientoComentario: 'Verde',
  etiquetaAutomatica: { id: 1 },
  productStore: { id: 1 },
};

const mockFeedback = {
  id: 1,
  imageId: undefined,
  comentarioId: 1,
};

const mockManager = {
  create: jest.fn().mockImplementation((entity, data) => {
    if (entity === Feedback) return { ...mockFeedback, ...data };
    return data;
  }),
  save: jest.fn().mockImplementation((entity, data) => {
    if (entity === Feedback) return Promise.resolve({ ...mockFeedback, ...data });
    return Promise.resolve(data);
  }),
};

const mockComentarioRepository = {
  create: jest.fn().mockReturnValue(mockComentario),
  save: jest.fn().mockResolvedValue(mockComentario),
  find: jest.fn().mockResolvedValue([mockComentario]),
  findOne: jest.fn().mockResolvedValue(mockComentario),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
  manager: mockManager, 
};

describe('ComentarioService', () => {
  let service: ComentarioService;
  let comentarioRepo: Repository<Comentario>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComentarioService,
        { provide: getRepositoryToken(Comentario), useValue: mockComentarioRepository },
        { provide: ChatGptService, useValue: {
          generarEtiqueta: jest.fn().mockResolvedValue('fruta'),
          generarSemaforoEmociones: jest.fn().mockResolvedValue('Verde'),
        }},
        { provide: EtiquetaAutomáticaService, useValue: {
          encontrarEtiqueta: jest.fn().mockResolvedValue({ id: 1 }),
        }},
        { provide: VisionService, useValue: {} },
        { provide: ProductsService, useValue: {} },
      ],
    }).compile();

    service = module.get<ComentarioService>(ComentarioService);
    comentarioRepo = module.get(getRepositoryToken(Comentario));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a comentario', async () => {
    const result = await service.createComentario('Great product', 1);
    expect(result).toEqual(expect.objectContaining(mockFeedback));
    expect(comentarioRepo.create).toHaveBeenCalled();
    expect(comentarioRepo.save).toHaveBeenCalled();
  });

  it('should get all comentarios', async () => {
    const result = await service.getComentarios();
    expect(result).toEqual([mockComentario]);
    expect(comentarioRepo.find).toHaveBeenCalled();
  });

  it('should get a comentario by id', async () => {
    const result = await service.getComentarioById(1);
    expect(result).toEqual(mockComentario);
    expect(comentarioRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should delete a comentario', async () => {
    const result = await service.deleteComentario(1);
    expect(result).toEqual(undefined);
    expect(comentarioRepo.delete).toHaveBeenCalledWith(1);
  });
});
