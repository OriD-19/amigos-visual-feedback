import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import * as PdfPrinter from 'pdfmake';
import { Response } from 'express';
import { Res } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwtAuth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

export class ReportQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Store ID to filter by' })
  store?: number;

  @ApiPropertyOptional({ example: 'banana', description: 'Product type/name to filter by' })
  type?: string;

  @ApiPropertyOptional({ example: '2024-06-01', description: 'Start date (YYYY-MM-DD)' })
  from?: string;

  @ApiPropertyOptional({ example: '2024-06-30', description: 'End date (YYYY-MM-DD)' })
  to?: string;
}

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('raw')
  @ApiOperation({ summary: 'Get a structured JSON report' })
  @ApiQuery({ name: 'store', required: false, type: Number, description: 'Store ID to filter by', example: 1 })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Product type/name to filter by', example: 'banana' })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'Start date (YYYY-MM-DD)', example: '2024-06-01' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'End date (YYYY-MM-DD)', example: '2024-06-30' })
  @ApiResponse({ status: 200, description: 'Structured report data' })
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
  @ApiOperation({ summary: 'Get a PDF report' })
  @ApiQuery({ name: 'store', required: false, type: Number, description: 'Store ID to filter by', example: 1 })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Product type/name to filter by', example: 'banana' })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'Start date (YYYY-MM-DD)', example: '2024-06-01' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'End date (YYYY-MM-DD)', example: '2024-06-30' })
  @ApiResponse({ status: 200, description: 'PDF file' })
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