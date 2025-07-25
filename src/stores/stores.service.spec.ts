import { Test, TestingModule } from '@nestjs/testing';
import { StoresService } from './stores.service';
import { Store } from './store.entity/store.entity';
import { ProductStore } from './../products/products.entity/product-store.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('StoresService', () => {
  let service: StoresService;
  let storeRepoMock: any;
  let productStoreRepoMock: any;

  beforeEach(async () => {
    storeRepoMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    productStoreRepoMock = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        { provide: getRepositoryToken(Store), useValue: storeRepoMock },
        { provide: getRepositoryToken(ProductStore), useValue: productStoreRepoMock },
      ],
    }).compile();

    service = module.get<StoresService>(StoresService);
  });

  it('should create a store', async () => {
    const dto = { name: 'Sucursal 1' , direction: 'Calle 123', managerId: 1 };
    const createdStore = { id: 1, name: 'Sucursal 1' };

    storeRepoMock.create.mockReturnValue(dto);
    storeRepoMock.save.mockResolvedValue(createdStore);

    const result = await service.create(dto);
    expect(result).toEqual(createdStore);
    expect(storeRepoMock.create).toHaveBeenCalledWith(dto);
    expect(storeRepoMock.save).toHaveBeenCalledWith(dto);
  });

  it('should get store products by store ID', async () => {
    const storeId = 2;
    const products = [{ product_id: 1, store_id: 2, stock: 15 }];

    productStoreRepoMock.find.mockResolvedValue(products);

    const result = await service.getStoreProducts(storeId);
    expect(result).toEqual(products);
    expect(productStoreRepoMock.find).toHaveBeenCalledWith({
      where: { store_id: storeId },
      relations: ['product'],
    });
  });

  it('should find all stores with products', async () => {
    const stores = [{ id: 1, name: 'Sucursal 1', productStores: [] }];
    storeRepoMock.find.mockResolvedValue(stores);

    const result = await service.findAll();
    expect(result).toEqual(stores);
    expect(storeRepoMock.find).toHaveBeenCalledWith({
      relations: ['productStores', 'productStores.product'],
    });
  });

  it('should find one store by ID', async () => {
    const store = { id: 1, name: 'Sucursal 1', productStores: [] };
    storeRepoMock.findOne.mockResolvedValue(store);

    const result = await service.findOne(1);
    expect(result).toEqual(store);
    expect(storeRepoMock.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['productStores', 'productStores.product'],
    });
  });
});