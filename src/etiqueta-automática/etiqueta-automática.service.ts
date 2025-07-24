import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EtiquetaAutomática } from './etiqueta-automática.entity';
import { Repository } from 'typeorm';
@Injectable()
export class EtiquetaAutomáticaService {
  constructor(
    @InjectRepository(EtiquetaAutomática)
    private etiquetaRepository: Repository<EtiquetaAutomática>,
  ) {}
  async createEtiqueta(nombre: string): Promise<EtiquetaAutomática> {
    const nuevaEtiqueta = this.etiquetaRepository.create({ nombre });
    return await this.etiquetaRepository.save(nuevaEtiqueta);
  }

  async encontrarEtiqueta(nombre: string): Promise<EtiquetaAutomática> {
    let etiqueta = await this.etiquetaRepository.findOne({ where: { nombre } });
    if (!etiqueta) {
      etiqueta = await this.createEtiqueta(nombre);
    }
    return etiqueta;
  }
}
