import { Test, TestingModule } from '@nestjs/testing';
import { StoresService } from './stores.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Store } from './store.entity/store.entity';
import { ProductStore } from '../products/products.entity/product-store.entity';
import { Repository } from 'typeorm';

describe('StoresService', () => {
  let service: StoresService;
  let storeRepoMock: Record<string, jest.Mock>;
  let productStoreRepoMock: Record<string, jest.Mock>;

  const mockStore = { id: 1, name: 'Central Branch', direction: '123 Main St' };
  const mockProduct = { id: 1, name: 'Banana', price: 1.99 };

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

    // Reset mocks before each test
    Object.values(storeRepoMock).forEach(fn => fn.mockReset && fn.mockReset());
    Object.values(productStoreRepoMock).forEach(fn => fn.mockReset && fn.mockReset());

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
    const dto = { name: 'Sucursal 1' , direction: 'Calle 123' };
    const mockUser = { userId: 1 };
    const createdStore = { id: 1, name: 'Sucursal 1', direction: 'Calle 123', managerId: 1 };

    storeRepoMock.create.mockReturnValue({ ...dto, managerId: 1 });
    storeRepoMock.save.mockResolvedValue(createdStore);

    const result = await service.create(dto, mockUser);
    expect(result).toEqual(createdStore);
    expect(storeRepoMock.create).toHaveBeenCalledWith({ ...dto, managerId: 1 });
    expect(storeRepoMock.save).toHaveBeenCalledWith({ ...dto, managerId: 1 });
  });

  it('should get all stores', async () => {
    storeRepoMock.find.mockResolvedValue([mockStore]);
    const result = await service.findAll();
    expect(result).toEqual([mockStore]);
    expect(storeRepoMock.find).toHaveBeenCalledWith({
      relations: ['productStores', 'productStores.product'],
    });
  });

  it('should get a store by id', async () => {
    storeRepoMock.findOne.mockResolvedValue(mockStore);
    const result = await service.findOne(1);
    expect(result).toEqual(mockStore);
    expect(storeRepoMock.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['productStores', 'productStores.product'] });
  });

  it('should get products for a store', async () => {
    const products = [mockProduct];
    productStoreRepoMock.find.mockResolvedValue(products);
    const result = await service.getStoreProducts(1);
    expect(result).toEqual(products);
    expect(productStoreRepoMock.find).toHaveBeenCalledWith({ where: { store_id: 1 }, relations: ['product'] });
  });
});
