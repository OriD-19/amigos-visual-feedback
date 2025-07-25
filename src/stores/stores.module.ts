import { Module } from '@nestjs/common';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './store.entity/store.entity';
import { ProductStore } from '.././products/products.entity/product-store.entity';
import { User } from './../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Store, ProductStore, User])],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}
