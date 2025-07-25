import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comentario } from './comentario.entity';
import { ChatGptService } from '../chatgpt/chatgpt.service';
import { EtiquetaAutomáticaService } from '../etiqueta-automática/etiqueta-automática.service';
import { Image } from './image.entity';
import { Feedback } from './feedback.entity';
import { Storage } from '@google-cloud/storage';
import * as path from 'path';
import { ImageLabel } from './image-label.entity';
import { VisionService } from '../vision/vision.service';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/products.entity/products.entity';

@Injectable()
export class ComentarioService {
  constructor(
    @InjectRepository(Comentario)
    private readonly comentarioRepository: Repository<Comentario>,

    private readonly chatgptservice: ChatGptService,

    private readonly etiquetaService: EtiquetaAutomáticaService,
    private readonly visionService: VisionService,
    private readonly productsService: ProductsService,
  ) {}
  async createComentario(user: any, comentario: string, productStoreId: number, file?: Express.Multer.File) {
    if (!user || user.role !== 'cliente') {
      throw new ForbiddenException('Only customers can submit feedback');
    }
    let imageEntity: Image | undefined = undefined;
    if (file) {
      const storage = new Storage({
        keyFilename: process.env.GCP_CREDENTIALS_PATH || path.join(__dirname, '../../keys/gcp-credentials.json'),
        projectId: process.env.GCP_PROJECT_ID,
      });
      const bucketName = process.env.GCP_BUCKET_NAME;
      if (!bucketName) {
        throw new Error('GCP_BUCKET_NAME environment variable is not set');
      }
      const bucket = storage.bucket(bucketName);
      const blob = bucket.file(Date.now() + '-' + file.originalname);
      const blobStream = blob.createWriteStream({ resumable: false });
      await new Promise((resolve, reject) => {
        blobStream.on('finish', resolve);
        blobStream.on('error', reject);
        blobStream.end(file.buffer);
      });
      const imageUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
      imageEntity = this.comentarioRepository.manager.create(Image, { url: imageUrl });
      await this.comentarioRepository.manager.save(Image, imageEntity);
    }
    const etiquetaChatgpt = await this.chatgptservice.generarEtiqueta(comentario);
    const etiquetaBase = await this.etiquetaService.encontrarEtiqueta(etiquetaChatgpt);
    const sentimiento = await this.chatgptservice.generarSemaforoEmociones(comentario);

    const productStoreRef = { id: productStoreId } as any;
    const nuevoComentario = this.comentarioRepository.create({
      textoComentario: comentario,
      sentimientoComentario: sentimiento,
      etiquetaAutomatica: { id: etiquetaBase.id },
      productStore: productStoreRef,
      user: user,
      userId: user.id,
    });
    const comentarioBase = await this.comentarioRepository.save(nuevoComentario);

    // Create Feedback entity linking image and comment
    const feedback = this.comentarioRepository.manager.create(Feedback, {
      imageId: imageEntity ? imageEntity.id : undefined,
      comentarioId: comentarioBase.id,
    });
    await this.comentarioRepository.manager.save(Feedback, feedback);

    let matchedProduct: Product | undefined = undefined;
    // Analyze image with Vision API
    if (imageEntity) {
      const visionResult = await this.visionService.analyzeImageFromUrl(imageEntity.url);
      const labels = visionResult.matchedSupermarketKeywords || [];
      const safeSearch = visionResult.safeSearch;
      // Check for inappropriate content
      const inappropriateLikelihoods = ['LIKELY', 'VERY_LIKELY'];
      if (
        safeSearch && (
          inappropriateLikelihoods.includes(String(safeSearch.adult)) ||
          inappropriateLikelihoods.includes(String(safeSearch.violence)) ||
          inappropriateLikelihoods.includes(String(safeSearch.racy)) ||
          inappropriateLikelihoods.includes(String(safeSearch.medical))
        )
      ) {
        // Delete the image from GCS
        const storage = new Storage({
          keyFilename: process.env.GCP_CREDENTIALS_PATH || path.join(__dirname, '../../keys/gcp-credentials.json'),
          projectId: process.env.GCP_PROJECT_ID,
        });
        const bucketName = process.env.GCP_BUCKET_NAME;
        if (bucketName) {
          const bucket = storage.bucket(bucketName);
          const fileName = imageEntity.url.split('/').pop();
          if (fileName) {
            await bucket.file(fileName).delete().catch(() => {});
          }
        }
        return {
          status: 'REJECTED',
          reason: 'La imagen contiene contenido inapropiado (adulto, violento, médico o subido de tono).',
          safeSearch,
        };
      }
      // Store all labels as ImageLabel entries
      if (labels.length > 0) {
        const labelEntities = labels.map(label => this.comentarioRepository.manager.create(ImageLabel, { label, image: imageEntity }));
        await this.comentarioRepository.manager.save(ImageLabel, labelEntities);
      }
      matchedProduct = await this.productsService.findProductByLabels(labels);
    }

    return feedback;
  }
  async getComentarios(user: any): Promise<Comentario[]> {
    if (!user) throw new ForbiddenException('Not authenticated');
    if (user.role === 'cliente') {
      // Only see own feedback
      return this.comentarioRepository.find({ where: { userId: user.id } });
    }
    // manager and auditor can see all
    return this.comentarioRepository.find();
  }

  async getComentarioById(user: any, id: number): Promise<Comentario> {
    const comentario = await this.comentarioRepository.findOne({ where: { id } });
    if (!comentario) {
      throw new NotFoundException('Comentario no encontrado');
    }
    if (user.role === 'cliente' && comentario.userId !== user.id) {
      throw new ForbiddenException('You can only view your own feedback');
    }
    // manager and auditor can view all
    return comentario;
  }
  async deleteComentario(user: any, id: number): Promise<void> {
    const comentario = await this.comentarioRepository.findOne({ where: { id } });
    if (!comentario) {
      throw new NotFoundException('Comentario no encontrado para eliminar');
    }
    if (user.role === 'cliente' && comentario.userId !== user.id) {
      throw new ForbiddenException('You can only delete your own feedback');
    }
    if (user.role !== 'manager' && user.role !== 'cliente') {
      throw new ForbiddenException('You do not have permission to delete feedback');
    }
    await this.comentarioRepository.delete(id);
  }
}
