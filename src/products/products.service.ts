import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './products.entity/products.entity';
import { Repository } from 'typeorm';
import { ProductStore } from './products.entity/product-store.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductStoreDto } from './dto/create-product-store.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(ProductStore)
        private productStoreRepository: Repository<ProductStore>
    ) { }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const product = this.productRepository.create(createProductDto);
        return await this.productRepository.save(product);
    }

    async findAll(): Promise<Product[]> {
        return await this.productRepository.find({
            relations: ['productStores'], 
        });
    }

    async findOne(id: number) {
        return await this.productRepository.findOne({
            where: { id },
            relations: ['productStores', 'productStores.store'],
        });
    }

    //para poder asignar los productos a las sucursales
    async assignToStore(productId: number, createProductStore: CreateProductStoreDto) {
        const productStore = this.productStoreRepository.create({
            product_id: productId,
            store_id: createProductStore.store_id,
            stock: createProductStore.stock,
            added_date: new Date(),
        });

        return await this.productStoreRepository.save(productStore);
    }

    //no estoy segura si vamos hacer todo esto, pero mejor más que menos?
    async removeFromStore(productId: number, storeId: number) {
        const result = await this.productStoreRepository.delete({
            product_id: productId,
            store_id: storeId,
        });

        if (result.affected === 0) {
            throw new NotFoundException('Product-Store relation not found');
        }
        return { message: 'Product removed from store successfully' };
    }

    //y este que creo que si nos sirve, para los reportes
    async getProductStores(productId: number) {
        return await this.productStoreRepository.find({
            where: { product_id: productId },
            relations: ['store'],
        });
    }

}
