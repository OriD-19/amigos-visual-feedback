import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './products.entity/products.entity';
import { ProductStore } from './products.entity/product-store.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepo: typeof productRepoMock;
  let productStoreRepo: typeof productStoreRepoMock;

  const mockProduct = { id: 1, name: 'Banana', price: 1.99 };
  const mockProductStore = { id: 1, product_id: 1, store_id: 1, stock: 10 };

  const productRepoMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const productStoreRepoMock = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    // Reset mocks before each test
    Object.values(productRepoMock).forEach(fn => fn.mockReset && fn.mockReset());
    Object.values(productStoreRepoMock).forEach(fn => fn.mockReset && fn.mockReset());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: productRepoMock },
        { provide: getRepositoryToken(ProductStore), useValue: productStoreRepoMock },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepo = productRepoMock;
    productStoreRepo = productStoreRepoMock;
  });

  it('should create a product', async () => {
    const dto: CreateProductDto = { name: 'Banana', price: 1.99, storeId: 1, stock: 10 };
    const expectedProductData = { name: 'Banana', price: 1.99, stock: 10, imageUrl: undefined };
    productRepo.create.mockReturnValue(expectedProductData);
    productRepo.save.mockResolvedValue(mockProduct);
    productStoreRepo.create.mockReturnValue(mockProductStore);
    productStoreRepo.save.mockResolvedValue(mockProductStore);

    const result = await service.create(dto);
    expect(productRepo.create).toHaveBeenCalledWith(expect.objectContaining(expectedProductData));
    expect(productRepo.save).toHaveBeenCalledWith(expectedProductData);
    expect(productStoreRepo.create).toHaveBeenCalledWith({
      product_id: mockProduct.id,
      store_id: dto.storeId,
      stock: dto.stock,
      added_date: expect.any(Date),
    });
    expect(productStoreRepo.save).toHaveBeenCalled();
    expect(result).toEqual(mockProduct);
  });

  it('should get all products', async () => {
    const result = await service.findAll();
    expect(result).toEqual([mockProduct]);
    expect(productRepo.find).toHaveBeenCalled();
  });

  it('should get a product by id', async () => {
    const result = await service.findOne(1);
    expect(result).toEqual(mockProduct);
    expect(productRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['productStores', 'productStores.store'] });
  });

  it('should assign a product to a store', async () => {
    const result = await service.assignToStore(1, { store_id: 1, stock: 10 });
    expect(productStoreRepo.create).toHaveBeenCalledWith({ product_id: 1, store_id: 1, stock: 10, added_date: expect.any(Date) });
    expect(productStoreRepo.save).toHaveBeenCalled();
    expect(result).toEqual(mockProductStore);
  });
});
