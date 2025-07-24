import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { ComentarioService } from './comentario.service';
import { Comentario } from './comentario.entity';

@Controller('comentarios')
export class ComentarioController {
  constructor(private readonly comentarioService: ComentarioService) {}
  @Post()
  async createComentario(
    @Body('comentario') comentario: string,
  ): Promise<Comentario> {
    return this.comentarioService.createComentario(comentario);
  }
  @Get()
  async getComentarios(): Promise<Comentario[]> {
    return this.comentarioService.getComentarios();
  }

  @Get(':id')
  async getComentarioById(@Param('id') id: number): Promise<Comentario> {
    return this.comentarioService.getComentarioById(id);
  }
  @Delete(':id')
  async deleteComentario(@Param('id') id: number): Promise<void> {
    return this.comentarioService.deleteComentario(id);
  }
}
