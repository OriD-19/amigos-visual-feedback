import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './store.entity/store.entity';
import { Repository } from 'typeorm';
import { ProductStore } from '../products/products.entity/product-store.entity';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoresService {
    constructor(
        @InjectRepository(Store)
        private storeRepository: Repository<Store>,
        @InjectRepository(ProductStore)
        private productStoreRepository: Repository<ProductStore>,
    ) { }


    async create(createStoreDto: CreateStoreDto): Promise<Store> {
        const store = this.storeRepository.create(createStoreDto);
        return await this.storeRepository.save(store);
    }

    async getStoreProducts(storeId: number) {
        return await this.productStoreRepository.find({
            where: { store_id: storeId },
            relations: ['product'],
        });
    }

    async findAll() {
        return await this.storeRepository.find({
            relations: ['productStores', 'productStores.product'],
        });
    }

    async findOne(id: number) {
        return await this.storeRepository.findOne({
            where: { id },
            relations: ['productStores', 'productStores.product'],
        });
    }
}
