import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products.entity/products.entity';
import { ProductStore } from './products.entity/product-store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductStore])], 
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
