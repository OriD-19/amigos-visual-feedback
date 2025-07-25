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

const mockCustomerUser = { id: 10, role: 'cliente' };
const mockOtherCustomerUser = { id: 20, role: 'cliente' };
const mockAuditorUser = { id: 30, role: 'auditor' };
const mockManagerUser = { id: 40, role: 'manager' };

const mockComentarioWithUser = {
  ...mockComentario,
  userId: mockCustomerUser.id,
  user: mockCustomerUser,
};

const mockComentarioWithOtherUser = {
  ...mockComentario,
  userId: mockOtherCustomerUser.id,
  user: mockOtherCustomerUser,
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
    const result = await service.createComentario(mockCustomerUser, 'Great product', 1);
    expect(result).toEqual(expect.objectContaining(mockFeedback));
    expect(comentarioRepo.create).toHaveBeenCalled();
    expect(comentarioRepo.save).toHaveBeenCalled();
  });

  it('should get all comentarios', async () => {
    const result = await service.getComentarios(mockCustomerUser);
    expect(result).toEqual([mockComentario]);
    expect(comentarioRepo.find).toHaveBeenCalled();
  });

  it('should get a comentario by id', async () => {
    const result = await service.getComentarioById(mockCustomerUser, 1);
    expect(result).toEqual(mockComentario);
    expect(comentarioRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should delete a comentario', async () => {
    mockComentarioRepository.findOne.mockResolvedValueOnce(mockComentarioWithUser);
    mockComentarioRepository.delete.mockResolvedValueOnce({ affected: 1 });
    const result = await service.deleteComentario(mockCustomerUser, 1);
    expect(result).toEqual(undefined);
    expect(comentarioRepo.delete).toHaveBeenCalledWith(1);
  });

  // CUSTOMER TESTS
  it('should allow customer to create feedback', async () => {
    await expect(service.createComentario(mockCustomerUser, 'Great product', 1)).resolves.toBeDefined();
  });

  it('should not allow auditor to create feedback', async () => {
    await expect(service.createComentario(mockAuditorUser, 'Great product', 1)).rejects.toThrow();
  });

  it('should not allow manager to create feedback', async () => {
    await expect(service.createComentario(mockManagerUser, 'Great product', 1)).rejects.toThrow();
  });

  it('should allow customer to view their own feedback', async () => {
    mockComentarioRepository.find.mockResolvedValueOnce([mockComentarioWithUser]);
    const result = await service.getComentarios(mockCustomerUser);
    expect(result).toEqual([mockComentarioWithUser]);
  });

  it('should not allow customer to view others feedback', async () => {
    mockComentarioRepository.findOne.mockResolvedValueOnce(mockComentarioWithOtherUser);
    await expect(service.getComentarioById(mockCustomerUser, 1)).rejects.toThrow();
  });

  it('should allow customer to delete their own feedback', async () => {
    mockComentarioRepository.findOne.mockResolvedValueOnce(mockComentarioWithUser);
    mockComentarioRepository.delete.mockResolvedValueOnce({ affected: 1 });
    await expect(service.deleteComentario(mockCustomerUser, 1)).resolves.toBeUndefined();
  });

  it('should not allow customer to delete others feedback', async () => {
    mockComentarioRepository.findOne.mockResolvedValueOnce(mockComentarioWithOtherUser);
    await expect(service.deleteComentario(mockCustomerUser, 1)).rejects.toThrow();
  });

  // AUDITOR TESTS
  it('should allow auditor to view all feedback', async () => {
    mockComentarioRepository.find.mockResolvedValueOnce([mockComentarioWithUser, mockComentarioWithOtherUser]);
    const result = await service.getComentarios(mockAuditorUser);
    expect(result).toEqual([mockComentarioWithUser, mockComentarioWithOtherUser]);
  });

  it('should allow auditor to view any feedback by id', async () => {
    mockComentarioRepository.findOne.mockResolvedValueOnce(mockComentarioWithUser);
    const result = await service.getComentarioById(mockAuditorUser, 1);
    expect(result).toEqual(mockComentarioWithUser);
  });

  it('should not allow auditor to delete feedback', async () => {
    mockComentarioRepository.findOne.mockResolvedValueOnce(mockComentarioWithUser);
    await expect(service.deleteComentario(mockAuditorUser, 1)).rejects.toThrow();
  });

  // MANAGER TESTS
  it('should allow manager to view all feedback', async () => {
    mockComentarioRepository.find.mockResolvedValueOnce([mockComentarioWithUser, mockComentarioWithOtherUser]);
    const result = await service.getComentarios(mockManagerUser);
    expect(result).toEqual([mockComentarioWithUser, mockComentarioWithOtherUser]);
  });

  it('should allow manager to view any feedback by id', async () => {
    mockComentarioRepository.findOne.mockResolvedValueOnce(mockComentarioWithOtherUser);
    const result = await service.getComentarioById(mockManagerUser, 1);
    expect(result).toEqual(mockComentarioWithOtherUser);
  });

  it('should allow manager to delete any feedback', async () => {
    mockComentarioRepository.findOne.mockResolvedValueOnce(mockComentarioWithOtherUser);
    mockComentarioRepository.delete.mockResolvedValueOnce({ affected: 1 });
    await expect(service.deleteComentario(mockManagerUser, 1)).resolves.toBeUndefined();
  });
});
