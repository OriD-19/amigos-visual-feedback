import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './products.entity/products.entity';
import { ProductStore } from './products.entity/product-store.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepo: Repository<Product>;
  let productStoreRepo: Repository<ProductStore>;

  const mockProduct = { id: 1, name: 'Banana', price: 1.99 };
  const mockProductStore = { id: 1, product_id: 1, store_id: 1, stock: 10 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: {
          create: jest.fn().mockReturnValue(mockProduct),
          save: jest.fn().mockResolvedValue(mockProduct),
          find: jest.fn().mockResolvedValue([mockProduct]),
          findOne: jest.fn().mockResolvedValue(mockProduct),
        }},
        { provide: getRepositoryToken(ProductStore), useValue: {
          create: jest.fn().mockReturnValue(mockProductStore),
          save: jest.fn().mockResolvedValue(mockProductStore),
          find: jest.fn().mockResolvedValue([mockProductStore]),
          findOne: jest.fn().mockResolvedValue(mockProductStore),
          delete: jest.fn().mockResolvedValue({ affected: 1 }),
        }},
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepo = module.get(getRepositoryToken(Product));
    productStoreRepo = module.get(getRepositoryToken(ProductStore));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a product', async () => {
    const dto = { imageUrl: undefined, name: 'Banana', price: 1.99, storeId: 1, stock: 10 };
    const expectedProductData = { imageUrl: undefined, name: 'Banana', price: 1.99, stock: 10 }; // no storeId
    const result = await service.create(dto as CreateProductDto);
    expect(productRepo.create).toHaveBeenCalledWith(expect.objectContaining(expectedProductData));
    expect(productRepo.save).toHaveBeenCalled();
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
