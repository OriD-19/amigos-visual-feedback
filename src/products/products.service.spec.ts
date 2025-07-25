import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { Product } from './products.entity/products.entity';
import { Store } from "./../stores/store.entity/store.entity";
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductStore } from './products.entity/product-store.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepoMock: any;
  let productStoreRepoMock: any;

  beforeEach(async () => {
    productRepoMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    productStoreRepoMock = {
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: productRepoMock },
        { provide: getRepositoryToken(ProductStore), useValue: productStoreRepoMock },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should create a product', async () => {
    const dto = { name: 'Phone', price: 23 };
    const entity = { id: 1, name: 'Phone' };

    productRepoMock.create.mockReturnValue(dto);
    productRepoMock.save.mockResolvedValue(entity);

    const result = await service.create(dto);
    expect(result).toEqual(entity);
    expect(productRepoMock.create).toHaveBeenCalledWith(dto);
    expect(productRepoMock.save).toHaveBeenCalledWith(dto);
  });

  it('should find all products with relations', async () => {
    const resultMock = [{ id: 1, name: 'Phone' }];
    productRepoMock.find.mockResolvedValue(resultMock);

    const result = await service.findAll();
    expect(result).toEqual(resultMock);
    expect(productRepoMock.find).toHaveBeenCalledWith({
      relations: ['productStores'],
    });
  });

  it('should find a product by ID with relations', async () => {
    const productMock = { id: 1, name: 'Phone' };
    productRepoMock.findOne.mockResolvedValue(productMock);

    const result = await service.findOne(1);
    expect(result).toEqual(productMock);
    expect(productRepoMock.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['productStores', 'productStores.store'],
    });
  });

  it('should assign product to store', async () => {
    const dto = { store_id: 2, stock: 10 };
    const relation = { product_id: 1, store_id: 2, stock: 10 };

    productStoreRepoMock.create.mockReturnValue(relation);
    productStoreRepoMock.save.mockResolvedValue(relation);

    const result = await service.assignToStore(1, dto);
    expect(result).toEqual(relation);
    expect(productStoreRepoMock.create).toHaveBeenCalledWith({
      product_id: 1,
      store_id: 2,
      stock: 10,
      added_date: expect.any(Date),
    });
    expect(productStoreRepoMock.save).toHaveBeenCalledWith(relation);
  });

  it('should remove product from store', async () => {
    productStoreRepoMock.delete.mockResolvedValue({ affected: 1 });

    const result = await service.removeFromStore(1, 2);
    expect(result).toEqual({ message: 'Product removed from store successfully' });
    expect(productStoreRepoMock.delete).toHaveBeenCalledWith({ product_id: 1, store_id: 2 });
  });

  it('should throw if product-store relation not found', async () => {
    productStoreRepoMock.delete.mockResolvedValue({ affected: 0 });

    await expect(service.removeFromStore(1, 2)).rejects.toThrow(
      new NotFoundException('Product-Store relation not found')
    );
  });

  it('should return product store relations', async () => {
    const mockRelations = [{ store_id: 2, stock: 10 }];
    productStoreRepoMock.find.mockResolvedValue(mockRelations);

    const result = await service.getProductStores(1);
    expect(result).toEqual(mockRelations);
    expect(productStoreRepoMock.find).toHaveBeenCalledWith({
      where: { product_id: 1 },
      relations: ['store'],
    });
  });
});