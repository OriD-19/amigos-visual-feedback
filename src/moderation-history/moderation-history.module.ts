import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModerationHistory } from './moderation-history.entity';
import { Feedback } from '../comentario/feedback.entity';
import { User } from '../users/entities/user.entity';
import { ModerationHistoryService } from './moderation-history.service';
import { ModerationHistoryController } from './moderation-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ModerationHistory, Feedback, User])],
  providers: [ModerationHistoryService],
  controllers: [ModerationHistoryController],
  exports: [ModerationHistoryService],
})
export class ModerationHistoryModule {} 