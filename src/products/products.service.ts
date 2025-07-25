import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './products.entity/products.entity';
import { Repository } from 'typeorm';
import { ProductStore } from './products.entity/product-store.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductStoreDto } from './dto/create-product-store.dto';
import { Storage } from '@google-cloud/storage';
import * as path from 'path';
import "dotenv/config";

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(ProductStore)
        private productStoreRepository: Repository<ProductStore>
    ) { }

    async create(createProductDto: CreateProductDto, file?: Express.Multer.File): Promise<Product> {
        let imageUrl: string | undefined = undefined;
        if (file) {
            const storage = new Storage({
                keyFilename: process.env.GCP_CREDENTIALS_PATH || path.join(__dirname, '../../keys/gcp-credentials.json'),
                projectId: process.env.GCP_PROJECT_ID,
            });
            const bucketName = process.env.GCP_BUCKET_NAME;
            if (!bucketName) {
                throw new Error('GCP_BUCKET_NAME environment variable is not set');
            }
            const bucket = storage.bucket(bucketName);
            const blob = bucket.file(Date.now() + '-' + file.originalname);
            const blobStream = blob.createWriteStream({ resumable: false });
            await new Promise((resolve, reject) => {
                blobStream.on('finish', resolve);
                blobStream.on('error', reject);
                blobStream.end(file.buffer);
            });
            imageUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
        }
        // Extract storeId and remove from DTO for product creation
        const { storeId, ...productData } = createProductDto;
        const product = this.productRepository.create({ ...productData, imageUrl });
        const savedProduct = await this.productRepository.save(product);
        // Create ProductStore association
        if (storeId) {
            const productStore = this.productStoreRepository.create({
                product_id: savedProduct.id,
                store_id: storeId,
                stock: createProductDto.stock,
                added_date: new Date(),
            });
            await this.productStoreRepository.save(productStore);
        }
        return savedProduct;
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

    async findProductByLabels(labels: string[]): Promise<Product | undefined> {
        for (const label of labels) {
            const product = await this.productRepository
                .createQueryBuilder('product')
                .where('LOWER(product.name) LIKE :label', { label: `%${label.toLowerCase()}%` })
                .getOne();
            if (product) return product;
        }
        return undefined;
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
