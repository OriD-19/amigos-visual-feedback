import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Feedback } from '../comentario/feedback.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity()
export class ModerationHistory {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => User, description: 'Auditor who reviewed the feedback' })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'auditorId' })
  auditor: User;

  @ApiProperty({ example: 2, description: 'Auditor user ID' })
  @Column()
  auditorId: number;

  @ApiProperty({ type: () => Feedback, description: 'Associated feedback' })
  @ManyToOne(() => Feedback, { eager: true })
  @JoinColumn({ name: 'feedbackId' })
  feedback: Feedback;

  @ApiProperty({ example: 3, description: 'Feedback ID' })
  @Column()
  feedbackId: number;

  @ApiProperty({ example: '2024-07-25T12:00:00.000Z', description: 'Timestamp of the review' })
  @CreateDateColumn()
  reviewedAt: Date;

  @ApiProperty({ example: 'approved', enum: ['approved', 'rejected', 'answered'], description: 'Moderation action' })
  @Column({ type: 'varchar' })
  action: 'approved' | 'rejected' | 'answered';

  @ApiPropertyOptional({ example: 'Spam content', description: 'Reason for rejection or moderation' })
  @Column({ type: 'text', nullable: true })
  reason?: string;

  @ApiPropertyOptional({ example: 'Thank you for your feedback!', description: 'Response to the customer' })
  @Column({ type: 'text', nullable: true })
  response?: string;

  @ApiPropertyOptional({ 
    example: 'Internal note: Customer complaint about product quality. Escalated to store manager for follow-up.', 
    description: 'Internal auditor comments for administrative purposes (not visible to customers)',
    maxLength: 1000
  })
  @Column({ type: 'text', nullable: true })
  comments?: string;
} 