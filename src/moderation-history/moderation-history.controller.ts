import { Controller, Post, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ModerationHistoryService } from './moderation-history.service';
import { JwtAuthGuard } from '../auth/jwtAuth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ModerationHistory } from './moderation-history.entity';

class ModerationActionDto {
  action: 'approved' | 'rejected' | 'answered';
  reason?: string;
  response?: string;
}

@ApiTags('Moderation History')
@ApiBearerAuth()
@Controller('moderation-history')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModerationHistoryController {
  constructor(private readonly moderationService: ModerationHistoryService) {}

  @Post(':feedbackId')
  @Roles('auditor')
  @ApiOperation({ summary: 'Moderate a feedback (approve, reject, or answer)' })
  @ApiParam({ name: 'feedbackId', example: 1, description: 'ID of the feedback to moderate' })
  @ApiBody({ type: ModerationActionDto })
  @ApiResponse({ status: 201, description: 'Moderation record created', type: ModerationHistory })
  async moderateFeedback(
    @Req() req,
    @Param('feedbackId') feedbackId: number,
    @Body() body: ModerationActionDto
  ) {
    return this.moderationService.createModeration(
      req.user,
      +feedbackId,
      body.action,
      body.reason,
      body.response
    );
  }

  @Get()
  @Roles('auditor')
  @ApiOperation({ summary: 'Get all moderation history records' })
  @ApiResponse({ status: 200, description: 'List of all moderation records', type: [ModerationHistory] })
  async getAllModerationHistory() {
    return this.moderationService.getAllModerationHistory();
  }

  @Get('feedback/:feedbackId')
  @Roles('auditor')
  @ApiOperation({ summary: 'Get moderation history for a specific feedback' })
  @ApiParam({ name: 'feedbackId', example: 1, description: 'ID of the feedback' })
  @ApiResponse({ status: 200, description: 'Moderation history for the feedback', type: [ModerationHistory] })
  async getModerationHistoryForFeedback(@Param('feedbackId') feedbackId: number) {
    return this.moderationService.getModerationHistoryForFeedback(+feedbackId);
  }
} 