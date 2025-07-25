import { Test, TestingModule } from '@nestjs/testing';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';

describe('StoresController', () => {
  let controller: StoresController;
  let service: StoresService;

  const mockStoresService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getStoreProducts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoresController],
      providers: [
        { provide: StoresService, useValue: mockStoresService },
      ],
    }).compile();

    controller = module.get<StoresController>(StoresController);
    service = module.get<StoresService>(StoresService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a store', async () => {
      const dto = { name: 'Store 1', direction: 'Address', managerId: 1 };
      const expected = { id: 1, ...dto };
      mockStoresService.create.mockResolvedValue(expected);

      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return all stores', async () => {
      const expected = [{ id: 1, name: 'Store 1' }];
      mockStoresService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should return a store by id', async () => {
      const expected = { id: 1, name: 'Store 1' };
      mockStoresService.findOne.mockResolvedValue(expected);

      const result = await controller.findOne(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });
  });

  describe('getStoreProducts', () => {
    it('should return all products for a store', async () => {
      const expected = [{ id: 1, product_id: 1, store_id: 1 }];
      mockStoresService.getStoreProducts.mockResolvedValue(expected);

      const result = await controller.getStoreProducts(1);
      expect(service.getStoreProducts).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });
  });
});
