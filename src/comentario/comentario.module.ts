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

@Module({
  imports: [TypeOrmModule.forFeature([Comentario, EtiquetaAutomática, Image, Feedback]), EtiquetaAutomáticaModule],
  controllers: [ComentarioController],
  providers: [ComentarioService, ChatGptService, EtiquetaAutomáticaService],
})
export class ComentarioModule { }
