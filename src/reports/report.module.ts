import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from '../comentario/feedback.entity';
import { Comentario } from '../comentario/comentario.entity';
import { Product } from '../products/products.entity/products.entity';
import { Store } from '../stores/store.entity/store.entity';
import { ProductStore } from '../products/products.entity/product-store.entity';
import { Image } from '../comentario/image.entity';
import { ImageLabel } from '../comentario/image-label.entity';
import { ReportService } from './report.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    Feedback, Comentario, Product, Store, ProductStore, Image, ImageLabel
  ])],
  providers: [ReportService],
  controllers: [ReportController],
})
export class ReportModule {} 