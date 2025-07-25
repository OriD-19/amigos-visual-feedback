import { Controller, Post, Body, Get, Param, Delete, UploadedFile, UseInterceptors, UseGuards, Req } from '@nestjs/common';
import { ComentarioService } from './comentario.service';
import { Comentario } from './comentario.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiProperty, ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwtAuth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

export class CreateComentarioDto {
  @ApiProperty({ example: 'The banana was rotten', description: 'Feedback comment' })
  comentario: string;

  @ApiProperty({ example: 1, description: 'ProductStore ID (product in a specific store)' })
  productStoreId: number;
}

@ApiTags('comentarios')
@Controller('comentarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComentarioController {
  constructor(private readonly comentarioService: ComentarioService) {}

  @Post()
  @Roles('cliente')
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
  @UseInterceptors(FileInterceptor('image'))
  async createComentario(
    @Req() req,
    @Body('comentario') comentario: string,
    @Body('productStoreId') productStoreId: number,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.comentarioService.createComentario(req.user, comentario, Number(productStoreId), file);
  }

  @Get()
  @Roles('cliente', 'manager', 'auditor')
  @ApiOperation({ summary: 'Get feedback comments (own for cliente, all for manager/auditor)' })
  @ApiResponse({ status: 200, description: 'List of feedback comments', type: [Comentario] })
  async getComentarios(@Req() req): Promise<Comentario[]> {
    return this.comentarioService.getComentarios(req.user);
  }

  @Get(':id')
  @Roles('cliente', 'manager', 'auditor')
  @ApiOperation({ summary: 'Get a feedback comment by ID (own for cliente, all for manager/auditor)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Feedback comment found', type: Comentario })
  async getComentarioById(@Req() req, @Param('id') id: number): Promise<Comentario> {
    return this.comentarioService.getComentarioById(req.user, id);
  }

  @Delete(':id')
  @Roles('cliente', 'manager')
  @ApiOperation({ summary: 'Delete a feedback comment by ID (own for cliente, any for manager)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Feedback comment deleted' })
  async deleteComentario(@Req() req, @Param('id') id: number): Promise<void> {
    return this.comentarioService.deleteComentario(req.user, id);
  }
}
