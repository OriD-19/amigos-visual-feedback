import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    assignToStore: jest.fn(),
    getProductStores: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const dto = { name: 'Test', price: 10, storeId: 1, stock: 5 };
      const expected = { id: 1, ...dto };
      mockProductsService.create.mockResolvedValue(expected);

      const result = await controller.create({ user: { id: 1 } }, dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const expected = [{ id: 1, name: 'A' }];
      mockProductsService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const expected = { id: 1, name: 'A' };
      mockProductsService.findOne.mockResolvedValue(expected);

      const result = await controller.findOne(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });
  });

  describe('assignToStore', () => {
    it('should assign a product to a store', async () => {
      const dto = { store_id: 2, stock: 10 };
      const expected = { id: 1, product_id: 1, store_id: 2, stock: 10 };
      mockProductsService.assignToStore.mockResolvedValue(expected);

      const result = await controller.assignToStore(1, dto);
      expect(service.assignToStore).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('getProductStores', () => {
    it('should return all stores for a product', async () => {
      const expected = [{ id: 1, product_id: 1, store_id: 2 }];
      mockProductsService.getProductStores.mockResolvedValue(expected);

      const result = await controller.getProductStores(1);
      expect(service.getProductStores).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });
  });
});
