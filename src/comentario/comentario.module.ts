import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComentarioController } from './comentario.controller';
import { ComentarioService } from './comentario.service';
import { ChatGptService } from '../chatgpt/chatgpt.service';
import { EtiquetaAutomáticaModule } from '../etiqueta-automática/etiqueta-automática.module';
import { EtiquetaAutomáticaService } from '../etiqueta-automática/etiqueta-automática.service';
import { EtiquetaAutomática } from '../etiqueta-automática/etiqueta-automática.entity';
import { Comentario } from './comentario.entity';
import { Feedback } from './feedback.entity';
import { Image } from './image.entity';
import { ImageLabel } from './image-label.entity';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/products.entity/products.entity';
import { ProductStore } from '../products/products.entity/product-store.entity';
import { VisionService } from '../vision/vision.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comentario, EtiquetaAutomática, Image, Feedback, ImageLabel, Product, ProductStore]), EtiquetaAutomáticaModule],
  controllers: [ComentarioController],
  providers: [ComentarioService, ChatGptService, EtiquetaAutomáticaService, ProductsService, VisionService],
})
export class ComentarioModule { }
