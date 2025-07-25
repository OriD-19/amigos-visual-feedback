import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from '../comentario/feedback.entity';
import { Comentario } from '../comentario/comentario.entity';
import { Product } from '../products/products.entity/products.entity';
import { Store } from '../stores/store.entity/store.entity';
import { ProductStore } from '../products/products.entity/product-store.entity';
import { Image } from '../comentario/image.entity';
import { ImageLabel } from '../comentario/image-label.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Feedback) private feedbackRepo: Repository<Feedback>,
    @InjectRepository(Comentario) private comentarioRepo: Repository<Comentario>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Store) private storeRepo: Repository<Store>,
    @InjectRepository(ProductStore) private productStoreRepo: Repository<ProductStore>,
    @InjectRepository(Image) private imageRepo: Repository<Image>,
    @InjectRepository(ImageLabel) private imageLabelRepo: Repository<ImageLabel>,
  ) {}

  async generateRawReport({ storeId, productType, from, to }: { storeId?: number, productType?: string, from?: string, to?: string }) {
    // Build query for feedback entries with joins
    const query = this.feedbackRepo.createQueryBuilder('feedback')
      .leftJoinAndSelect('feedback.comentario', 'comentario')
      .leftJoinAndSelect('comentario.productStore', 'productStore')
      .leftJoinAndSelect('productStore.product', 'product')
      .leftJoinAndSelect('productStore.store', 'store')
      .leftJoinAndSelect('feedback.image', 'image')
      .leftJoinAndSelect('image.labels', 'labels');

    if (storeId) query.andWhere('store.id = :storeId', { storeId });
    if (productType) query.andWhere('product.name ILIKE :productType', { productType: `%${productType}%` });
    if (from) query.andWhere('comentario.createdAt >= :from', { from });
    if (to) query.andWhere('comentario.createdAt <= :to', { to });

    const feedbacks = await query.getMany();

    // Summary metrics
    const total = feedbacks.length;
    const emotionCounts = { red: 0, yellow: 0, green: 0 };
    const issueCounts: Record<string, number> = {};
    for (const fb of feedbacks) {
      const emotion = fb.comentario.sentimientoComentario;
      // Map Spanish to English for counting
      if (emotion === 'Rojo') emotionCounts.red++;
      else if (emotion === 'Amarillo') emotionCounts.yellow++;
      else if (emotion === 'Verde') emotionCounts.green++;
      for (const label of fb.image?.labels || []) {
        issueCounts[label.label] = (issueCounts[label.label] || 0) + 1;
      }
    }
    const topIssues = Object.entries(issueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([label]) => label);

    // Detailed entry table
    const entries = feedbacks.map(fb => ({
      timestamp: fb.comentario['createdAt'],
      product: fb.comentario.productStore?.product?.name,
      store: fb.comentario.productStore?.store?.name,
      feedback: fb.comentario.textoComentario,
      emotion: fb.comentario.sentimientoComentario,
      issues: (fb.image?.labels || []).map(l => l.label),
    }));

    return {
      meta: {
        store: storeId,
        productType,
        dateRange: { from, to },
        generatedAt: new Date().toISOString(),
      },
      summary: {
        totalFeedback: total,
        emotionCounts,
        topIssues,
      },
      entries,
    };
  }

  buildPdfDocDefinition(report: any) {
    return {
      content: [
        { text: 'Feedback Report', style: 'header' },
        { text: `Store: ${report.meta.store || 'All'} | Product: ${report.meta.productType || 'All'} | Date: ${report.meta.dateRange.from || '-'} to ${report.meta.dateRange.to || '-'}`, margin: [0, 0, 0, 10] },
        { text: `Generated at: ${report.meta.generatedAt}`, margin: [0, 0, 0, 10], fontSize: 9 },
        { text: 'Summary', style: 'subheader' },
        {
          ul: [
            `Total feedback: ${report.summary.totalFeedback}`,
            `Red: ${report.summary.emotionCounts.red}, Yellow: ${report.summary.emotionCounts.yellow}, Green: ${report.summary.emotionCounts.green}`,
            `Top issues: ${report.summary.topIssues.join(', ') || 'None'}`,
          ],
          margin: [0, 0, 0, 10],
        },
        { text: 'Detailed Entries', style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', 'auto', '*'],
            body: [
              ['Timestamp', 'Product', 'Store', 'Feedback', 'Emotion', 'Labels'],
              ...report.entries.map(e => [
                e.timestamp ? new Date(e.timestamp).toLocaleString() : '-',
                e.product || '-',
                e.store || '-',
                e.feedback || '-',
                { text: e.emotion || '-', color: e.emotion === 'Rojo' ? 'red' : e.emotion === 'Amarillo' ? 'orange' : e.emotion === 'Verde' ? 'green' : 'black' },
                (e.issues && e.issues.length > 0) ? e.issues.join(', ') : '-',
              ]),
            ],
          },
          fontSize: 9,
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
      },
      defaultStyle: {
        font: 'Roboto',
      },
    };
  }
} 