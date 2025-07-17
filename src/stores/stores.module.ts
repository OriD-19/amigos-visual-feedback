import { Module } from '@nestjs/common';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './store.entity/store.entity';
import { ProductStore } from 'src/products/products.entity/product-store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Store, ProductStore])],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}
