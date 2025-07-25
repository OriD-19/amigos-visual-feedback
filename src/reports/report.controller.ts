import { Controller, Get, Query } from '@nestjs/common';
import { ReportService } from './report.service';
import * as PdfPrinter from 'pdfmake';
import { Response } from 'express';
import { Res } from '@nestjs/common';

export class ReportQueryDto {
  store?: number;
  type?: string;
  from?: string;
  to?: string;
}

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('raw')
  async getRawReport(
    @Query('store') storeId?: number,
    @Query('type') productType?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportService.generateRawReport({ storeId, productType, from, to });
  }

  // PDFMake font setup:
  // Place the following files in src/reports/fonts/:
  // - Roboto-Regular.ttf
  // - Roboto-Medium.ttf
  // - Roboto-Italic.ttf
  // - Roboto-MediumItalic.ttf
  // You can download these from the official pdfmake repo or Google Fonts.
  @Get('pdf')
  async getPdfReport(
    @Query() query: ReportQueryDto,
    @Res() res: Response,
  ) {
    const report = await this.reportService.generateRawReport({ storeId: query.store, productType: query.type, from: query.from, to: query.to });
    // Build PDF document definition
    const docDefinition = this.reportService.buildPdfDocDefinition(report);
    const fonts = {
      Roboto: {
        normal: 'src/reports/fonts/Roboto-Regular.ttf',
        bold: 'src/reports/fonts/Roboto-Medium.ttf',
        italics: 'src/reports/fonts/Roboto-Italic.ttf',
        bolditalics: 'src/reports/fonts/Roboto-MediumItalic.ttf',
      },
    };
    const printer = new PdfPrinter(fonts);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    pdfDoc.pipe(res);
    pdfDoc.end();
  }
} 