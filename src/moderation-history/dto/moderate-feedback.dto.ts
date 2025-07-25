import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export enum ModerationAction {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ANSWERED = 'answered',
}

export class ModerateFeedbackDto {
  @ApiProperty({
    description: 'The moderation action to perform on the feedback',
    enum: ModerationAction,
    example: ModerationAction.APPROVED,
    examples: {
      approved: { value: ModerationAction.APPROVED, summary: 'Approve the feedback' },
      rejected: { value: ModerationAction.REJECTED, summary: 'Reject the feedback' },
      answered: { value: ModerationAction.ANSWERED, summary: 'Answer the feedback' },
    }
  })
  @IsEnum(ModerationAction)
  @IsNotEmpty()
  action: ModerationAction;

  @ApiPropertyOptional({
    description: 'Reason for rejection or additional context for the moderation action',
    example: 'Content violates community guidelines',
    maxLength: 500,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({
    description: 'Response message to the customer (required when action is "answered")',
    example: 'Thank you for your feedback. We have addressed the issue you mentioned.',
    maxLength: 1000,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  response?: string;

  @ApiPropertyOptional({
    description: 'Internal auditor comments for administrative purposes (not visible to customers)',
    example: 'Internal note: Customer complaint about product quality. Escalated to store manager for follow-up.',
    maxLength: 1000,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comments?: string;
} 