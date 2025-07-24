import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comentario } from './comentario.entity';
import { ChatGptService } from 'src/chatgpt/chatgpt.service';
import { EtiquetaAutomáticaService } from 'src/etiqueta-automática/etiqueta-automática.service';

@Injectable()
export class ComentarioService {
  constructor(
    @InjectRepository(Comentario)
    private readonly comentarioRepository: Repository<Comentario>,

    private readonly chatgptservice: ChatGptService,

    private readonly etiquetaService: EtiquetaAutomáticaService,
  ) {}
  async createComentario(comentario: string) {
    const etiquetaChatgpt =
      await this.chatgptservice.generarEtiqueta(comentario);
    const etiquetaBase =
      await this.etiquetaService.encontrarEtiqueta(etiquetaChatgpt);
    const sentimiento =
      await this.chatgptservice.generarSemaforoEmociones(comentario);

    const nuevoComentario = this.comentarioRepository.create({
      textoComentario: comentario,
      sentimientoComentario: sentimiento,
      etiquetaAutomatica: { id: etiquetaBase.id },
    });

    const comentarioBase =
      await this.comentarioRepository.save(nuevoComentario);
    return comentarioBase;
  }
  async getComentarios(): Promise<Comentario[]> {
    return this.comentarioRepository.find();
  }

  async getComentarioById(id: number): Promise<Comentario> {
    const comentario = await this.comentarioRepository.findOne({
      where: { id },
    });
    if (!comentario) {
      throw new NotFoundException('Comentario no encontrado');
    }

    return comentario;
  }
  async deleteComentario(id: number): Promise<void> {
    const resultado = await this.comentarioRepository.delete(id);

    if (resultado.affected === 0) {
      throw new NotFoundException('Comentario no encontrado para eliminar');
    }
  }
}
