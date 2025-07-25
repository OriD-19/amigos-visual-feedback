import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModerationHistory } from './moderation-history.entity';
import { Feedback } from '../comentario/feedback.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ModerationHistoryService {
  constructor(
    @InjectRepository(ModerationHistory)
    private readonly moderationRepo: Repository<ModerationHistory>,
    @InjectRepository(Feedback)
    private readonly feedbackRepo: Repository<Feedback>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createModeration(auditor: any, feedbackId: number, action: 'approved' | 'rejected' | 'answered', reason?: string, response?: string, comments?: string) {
    if (!auditor || (auditor.role !== 'manager' && auditor.role !== 'admin')) {
      throw new ForbiddenException('Only managers and admins can moderate feedback');
    }
    const feedback = await this.feedbackRepo.findOne({ where: { id: feedbackId } });
    if (!feedback) throw new NotFoundException('Feedback not found');
    
    // Get the actual user entity for the auditor
    const auditorUser = await this.userRepo.findOne({ where: { id: auditor.userId || auditor.id } });
    if (!auditorUser) {
      throw new NotFoundException('Auditor user not found');
    }
    
    const moderation = this.moderationRepo.create({
      auditor: auditorUser,
      auditorId: auditorUser.id,
      feedback,
      feedbackId,
      action,
      reason,
      response,
      comments,
    });
    return this.moderationRepo.save(moderation);
  }

  async getModerationHistoryForFeedback(feedbackId: number) {
    return this.moderationRepo.find({ where: { feedbackId } });
  }

  async getAllModerationHistory() {
    return this.moderationRepo.find();
  }
} 