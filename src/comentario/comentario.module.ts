import { Module } from '@nestjs/common';
import { ComentarioService } from './comentario.service';
import { ComentarioController } from './comentario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comentario } from './comentario.entity';
import { ChatGptService } from 'src/chatgpt/chatgpt.service';
import { EtiquetaAutomáticaModule } from 'src/etiqueta-automática/etiqueta-automática.module';
import { EtiquetaAutomáticaService } from 'src/etiqueta-automática/etiqueta-automática.service';
import { EtiquetaAutomática } from 'src/etiqueta-automática/etiqueta-automática.entity';
import { Image } from './image.entity';
import { Feedback } from './feedback.entity';
import { ImageLabel } from './image-label.entity';
import { ProductsService } from 'src/products/products.service';
import { Product } from 'src/products/products.entity/products.entity';
import { ProductStore } from 'src/products/products.entity/product-store.entity';
import { VisionService } from 'src/vision/vision.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comentario, EtiquetaAutomática, Image, Feedback, ImageLabel, Product, ProductStore]), EtiquetaAutomáticaModule],
  controllers: [ComentarioController],
  providers: [ComentarioService, ChatGptService, EtiquetaAutomáticaService, ProductsService, VisionService],
})
export class ComentarioModule { }
