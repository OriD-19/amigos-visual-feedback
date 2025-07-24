import { Module } from '@nestjs/common';
import { VisionService } from './vision.service';
import { VisionController } from './vision.controller';

@Module({
    controllers: [VisionController],
    providers: [VisionService],
    exports: [VisionService],
})

export class VisionModule {}