import { Module } from '@nestjs/common';
import { EtiquetaAutomáticaService } from './etiqueta-automática.service';
import { EtiquetaAutomáticaController } from './etiqueta-automática.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EtiquetaAutomática } from './etiqueta-automática.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EtiquetaAutomática])],
  controllers: [EtiquetaAutomáticaController],
  providers: [EtiquetaAutomáticaService],
})
export class EtiquetaAutomáticaModule {}
