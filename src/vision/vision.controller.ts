import { Controller, Post, Body } from '@nestjs/common';
import { VisionService } from './vision.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('vision')
@Controller('vision')
export class VisionController {
  constructor(private readonly visionService: VisionService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze an image using Google Vision API' })
  @ApiBody({ schema: { type: 'object', properties: { imageUrl: { type: 'string', example: 'https://storage.googleapis.com/bucket/image.jpg' } }, required: ['imageUrl'] } })
  @ApiResponse({ status: 200, description: 'Analysis result from Google Vision API' })
  async analyze(@Body() body: { imageUrl: string }) {
    return this.visionService.analyzeImageFromUrl(body.imageUrl);
  }
}
