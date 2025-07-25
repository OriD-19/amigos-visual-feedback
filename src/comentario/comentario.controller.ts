import { Controller, Post, Body, Get, Param, Delete, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ComentarioService } from './comentario.service';
import { Comentario } from './comentario.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiProperty, ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';

export class CreateComentarioDto {
  @ApiProperty({ example: 'The banana was rotten', description: 'Feedback comment' })
  comentario: string;

  @ApiProperty({ example: 1, description: 'ProductStore ID (product in a specific store)' })
  productStoreId: number;
}

@ApiTags('comentarios')
@Controller('comentarios')
export class ComentarioController {
  constructor(private readonly comentarioService: ComentarioService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new feedback comment with optional image proof' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Feedback comment data and optional image',
    schema: {
      type: 'object',
      properties: {
        comentario: { type: 'string', example: 'The banana was rotten' },
        productStoreId: { type: 'number', example: 1 },
        image: { type: 'string', format: 'binary', description: 'Proof image (optional)' }
      },
      required: ['comentario', 'productStoreId']
    }
  })
  @ApiResponse({ status: 201, description: 'Feedback created successfully' })
  async createComentario(
    @Body() body: CreateComentarioDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.comentarioService.createComentario(body.comentario, body.productStoreId, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all feedback comments' })
  @ApiResponse({ status: 200, description: 'List of feedback comments', type: [Comentario] })
  async getComentarios(): Promise<Comentario[]> {
    return this.comentarioService.getComentarios();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a feedback comment by ID' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Feedback comment found', type: Comentario })
  async getComentarioById(@Param('id') id: number): Promise<Comentario> {
    return this.comentarioService.getComentarioById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a feedback comment by ID' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Feedback comment deleted' })
  async deleteComentario(@Param('id') id: number): Promise<void> {
    return this.comentarioService.deleteComentario(id);
  }
}
