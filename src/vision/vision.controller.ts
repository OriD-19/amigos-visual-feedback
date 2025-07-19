import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VisionService } from './vision.service';

@Controller('vision')
export class VisionController{
    constructor(private readonly visionService: VisionService){}

    @Post('analyze')
    @UseInterceptors(FileInterceptor('image'))
    async analyze(@UploadedFile() file: Express.Multer.File)
    {
        return this.visionService.uploadImageAndAnalyze(file);
    }
}