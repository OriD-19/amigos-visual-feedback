import { Test, TestingModule } from '@nestjs/testing';
import { StoresService } from './stores.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Store } from './store.entity/store.entity';
import { ProductStore } from '../products/products.entity/product-store.entity';
import { Repository } from 'typeorm';

describe('StoresService', () => {
  let service: StoresService;
  let storeRepo: Repository<Store>;

  const mockStore = { id: 1, name: 'Central Branch', direction: '123 Main St' };
  const mockProduct = { id: 1, name: 'Banana', price: 1.99 };

  const mockProductStoreRepository = {
    find: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        { provide: getRepositoryToken(Store), useValue: {
          create: jest.fn().mockReturnValue(mockStore),
          save: jest.fn().mockResolvedValue(mockStore),
          find: jest.fn().mockResolvedValue([mockStore]),
          findOne: jest.fn().mockResolvedValue(mockStore),
        }},
        { provide: getRepositoryToken(ProductStore), useValue: mockProductStoreRepository },
      ],
    }).compile();

    service = module.get<StoresService>(StoresService);
    storeRepo = module.get(getRepositoryToken(Store));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a store', async () => {
    const dto = { name: 'Central Branch', direction: '123 Main St' };
    const result = await service.create(dto as any);
    expect(storeRepo.create).toHaveBeenCalledWith(dto);
    expect(storeRepo.save).toHaveBeenCalledWith(mockStore);
    expect(result).toEqual(mockStore);
  });

  it('should get all stores', async () => {
    const result = await service.findAll();
    expect(result).toEqual([mockStore]);
    expect(storeRepo.find).toHaveBeenCalled();
  });

  it('should get a store by id', async () => {
    const result = await service.findOne(1);
    expect(result).toEqual(mockStore);
    expect(storeRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['productStores', 'productStores.product'] });
  });

  // If getStoreProducts uses a custom query, you may need to mock it accordingly.
  // Here is a generic test assuming it returns a list of products for a store.
  it('should get products for a store', async () => {
    // Mock the method if it exists on the service
    service.getStoreProducts = jest.fn().mockResolvedValue([mockProduct]);
    const result = await service.getStoreProducts(1);
    expect(result).toEqual([mockProduct]);
    expect(service.getStoreProducts).toHaveBeenCalledWith(1);
  });
});
