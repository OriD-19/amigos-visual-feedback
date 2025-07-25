import { Test, TestingModule } from '@nestjs/testing';
import { ComentarioController } from './comentario.controller';
import { ComentarioService } from './comentario.service';
import { UnauthorizedException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('ComentarioController - Integration Tests', () => {
  let controller: ComentarioController;
  let service: ComentarioService;

  const mockComentarioService = {
    createComentario: jest.fn(),
    getComentarios: jest.fn(),
    getComentarioById: jest.fn(),
    deleteComentario: jest.fn(),
  };

  const mockUser = { id: 1, role: 'cliente' };
  const mockRequest = { user: mockUser };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComentarioController],
      providers: [
        {
          provide: ComentarioService,
          useValue: mockComentarioService,
        },
      ],
    }).compile();

    controller = module.get<ComentarioController>(ComentarioController);
    service = module.get<ComentarioService>(ComentarioService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /comentarios - HTTP Integration', () => {
    it('should create comentario and return HTTP 201 with feedback object', async () => {
      // Arrange
      const createDto = { comentario: 'Great product', productStoreId: 1 };
      const expectedFeedback = { id: 1, comentarioId: 1 };
      
      mockComentarioService.createComentario.mockResolvedValue(expectedFeedback);

      // Act
      const result = await controller.createComentario(mockRequest, createDto);

      // Assert
      expect(service.createComentario).toHaveBeenCalledWith(
        mockUser, 
        createDto.comentario, 
        createDto.productStoreId,
        undefined
      );
      expect(result).toEqual(expectedFeedback);
    });

    it('should handle service authorization errors as HTTP exceptions', async () => {
      // Arrange
      const createDto = { comentario: 'Test', productStoreId: 1 };
      mockComentarioService.createComentario.mockRejectedValue(
        new Error('Only customers can create feedback')
      );

      // Act & Assert
      await expect(controller.createComentario(mockRequest, createDto))
        .rejects.toThrow();
    });
  });

  describe('GET /comentarios - HTTP Integration', () => {
    it('should return HTTP 200 with comentarios array', async () => {
      // Arrange
      const expectedComentarios = [
        { id: 1, textoComentario: 'Good' },
        { id: 2, textoComentario: 'Bad' }
      ];
      mockComentarioService.getComentarios.mockResolvedValue(expectedComentarios);

      // Act
      const result = await controller.getComentarios(mockRequest);

      // Assert
      expect(service.getComentarios).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(expectedComentarios);
    });

    it('should return empty array when no comentarios exist', async () => {
      // Arrange
      mockComentarioService.getComentarios.mockResolvedValue([]);

      // Act
      const result = await controller.getComentarios(mockRequest);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('GET /comentarios/:id - HTTP Integration', () => {
    it('should return HTTP 200 with specific comentario', async () => {
      // Arrange
      const comentarioId = '1';
      const expectedComentario = { id: 1, textoComentario: 'Test' };
      mockComentarioService.getComentarioById.mockResolvedValue(expectedComentario);

      // Act
      const result = await controller.getComentarioById(mockRequest, Number(comentarioId));

      // Assert
      expect(service.getComentarioById).toHaveBeenCalledWith(mockUser, 1);
      expect(result).toEqual(expectedComentario);
    });

    it('should handle string to number conversion for ID parameter', async () => {
      // Arrange
      const comentarioId = '123';
      mockComentarioService.getComentarioById.mockResolvedValue({ id: 123 });

      // Act
      await controller.getComentarioById(mockRequest, Number(comentarioId));

      // Assert
      expect(service.getComentarioById).toHaveBeenCalledWith(mockUser, 123);
    });

    it('should handle authorization errors from service', async () => {
      // Arrange
      mockComentarioService.getComentarioById.mockRejectedValue(
        new Error('Access denied')
      );

      // Act & Assert
      await expect(controller.getComentarioById(mockRequest, Number('1')))
        .rejects.toThrow('Access denied');
    });
  });

  describe('DELETE /comentarios/:id - HTTP Integration', () => {
    it('should return HTTP 204 (no content) on successful deletion', async () => {
      // Arrange
      const comentarioId = '1';
      mockComentarioService.deleteComentario.mockResolvedValue(undefined);

      // Act
      const result = await controller.deleteComentario(mockRequest, Number(comentarioId));

      // Assert
      expect(service.deleteComentario).toHaveBeenCalledWith(mockUser, 1);
      expect(result).toBeUndefined();
    });

    it('should handle authorization errors for deletion', async () => {
      // Arrange
      mockComentarioService.deleteComentario.mockRejectedValue(
        new Error('Cannot delete others feedback')
      );

      // Act & Assert
      await expect(controller.deleteComentario(mockRequest, Number('1')))
        .rejects.toThrow('Cannot delete others feedback');
    });
  });

  describe('Request Object Integration', () => {
    it('should correctly extract user from request object', async () => {
      // Arrange
      const customRequest = { 
        user: { id: 99, role: 'manager' } 
      };
      mockComentarioService.getComentarios.mockResolvedValue([]);

      // Act
      await controller.getComentarios(customRequest);

      // Assert
      expect(service.getComentarios).toHaveBeenCalledWith(customRequest.user);
    });

    it('should handle missing user in request', async () => {
      // Arrange
      const requestWithoutUser = {};
      mockComentarioService.getComentarios.mockImplementation((user) => {
        if (!user) throw new ForbiddenException('Not authenticated');
        return [];
      });
      // Act & Assert
      await expect(controller.getComentarios(requestWithoutUser))
        .rejects.toThrow();
    });
  });

  describe('Parameter Transformation', () => {
    it('should convert string parameters to numbers correctly', async () => {
      // Arrange
      const stringId = '456';
      const expectedNumericId = 456;
      mockComentarioService.getComentarioById.mockResolvedValue({});

      // Act
      await controller.getComentarioById(mockRequest, Number(stringId));

      // Assert
      expect(service.getComentarioById).toHaveBeenCalledWith(
        mockUser, 
        expectedNumericId
      );
    });

    it('should handle invalid ID formats', async () => {
      // Arrange
      const invalidId = 'not-a-number';
      mockComentarioService.getComentarioById.mockImplementation((user, id) => {
        if (isNaN(id)) throw new NotFoundException('Comentario no encontrado');
        return {};
      });
      // Act & Assert
      await expect(controller.getComentarioById(mockRequest, Number(invalidId)))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('Error Propagation', () => {
    it('should propagate service errors without modification', async () => {
      // Arrange
      const serviceError = new Error('Service specific error');
      mockComentarioService.createComentario.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.createComentario(mockRequest, { comentario: 'test', productStoreId: 1 }))
        .rejects.toThrow('Service specific error');
    });
  });
});