import { Controller, Post, Body, Get, Param, Delete, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ComentarioService } from './comentario.service';
import { Comentario } from './comentario.entity';
import { FileInterceptor } from '@nestjs/platform-express';

class CreateComentarioDto {
  comentario: string;
  productStoreId: number;
}

@Controller('comentarios')
export class ComentarioController {
  constructor(private readonly comentarioService: ComentarioService) {}
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createComentario(
    @Body() body: CreateComentarioDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.comentarioService.createComentario(body.comentario, body.productStoreId, file);
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
