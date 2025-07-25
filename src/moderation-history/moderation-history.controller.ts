import { Controller, Post, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ModerationHistoryService } from './moderation-history.service';
import { JwtAuthGuard } from '../auth/jwtAuth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiConsumes, ApiProduces } from '@nestjs/swagger';
import { ModerationHistory } from './moderation-history.entity';
import { ModerateFeedbackDto } from './dto/moderate-feedback.dto';

@ApiTags('Moderation History')
@ApiBearerAuth()
@Controller('moderation-history')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModerationHistoryController {
  constructor(private readonly moderationService: ModerationHistoryService) {}

  @Post(':feedbackId')
  @Roles('auditor')
  @ApiOperation({ 
    summary: 'Moderate a feedback (approve, reject, or answer)',
    description: `
    Allows auditors to moderate customer feedback by performing one of three actions:
    
    - **approved**: Approve the feedback for public display
    - **rejected**: Reject the feedback (requires reason)
    - **answered**: Provide a response to the customer (requires response message)
    
    **Required Permissions**: Only users with 'auditor' role can access this endpoint.
    
    **Business Rules**:
    - When action is 'rejected', a reason must be provided
    - When action is 'answered', a response message must be provided
    - Each moderation action is logged with timestamp and auditor information
    - Comments field is optional and for internal administrative use only
    `
  })
  @ApiParam({ 
    name: 'feedbackId', 
    example: 1, 
    description: 'ID of the feedback to moderate',
    type: 'number'
  })
  @ApiBody({ 
    type: ModerateFeedbackDto,
    description: 'Moderation action details',
    examples: {
      approve: {
        summary: 'Approve feedback',
        value: {
          action: 'approved'
        }
      },
      reject: {
        summary: 'Reject feedback with reason',
        value: {
          action: 'rejected',
          reason: 'Content violates community guidelines'
        }
      },
      answer: {
        summary: 'Answer feedback with response',
        value: {
          action: 'answered',
          response: 'Thank you for your feedback. We have addressed the issue you mentioned.'
        }
      },
      approveWithComments: {
        summary: 'Approve feedback with internal comments',
        value: {
          action: 'approved',
          comments: 'Internal note: Customer complaint about product quality. Escalated to store manager for follow-up.'
        }
      },
      rejectWithComments: {
        summary: 'Reject feedback with reason and internal comments',
        value: {
          action: 'rejected',
          reason: 'Inappropriate language used',
          comments: 'Internal note: Customer used offensive language. Flagged for review by management.'
        }
      }
    }
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({ 
    status: 201, 
    description: 'Moderation record created successfully',
    type: ModerationHistory,
    schema: {
      example: {
        id: 1,
        auditorId: 2,
        feedbackId: 1,
        reviewedAt: '2024-01-15T10:30:00.000Z',
        action: 'approved',
        reason: null,
        response: null,
        comments: 'Internal note: Customer complaint about product quality. Escalated to store manager for follow-up.'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid action or missing required fields',
    schema: {
      example: {
        statusCode: 400,
        message: ['action must be one of the following values: approved, rejected, answered'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - User does not have auditor role',
    schema: {
      example: {
        statusCode: 403,
        message: 'Access denied. Auditor role required.',
        error: 'Forbidden'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Feedback not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Feedback not found',
        error: 'Not Found'
      }
    }
  })
  async moderateFeedback(
    @Req() req,
    @Param('feedbackId') feedbackId: number,
    @Body() body: ModerateFeedbackDto
  ) {
    return this.moderationService.createModeration(
      req.user,
      +feedbackId,
      body.action,
      body.reason,
      body.response,
      body.comments
    );
  }

  @Get()
  @Roles('auditor')
  @ApiOperation({ 
    summary: 'Get all moderation history records',
    description: 'Retrieves all moderation history records. Only accessible by auditors.'
  })
  @ApiProduces('application/json')
  @ApiResponse({ 
    status: 200, 
    description: 'List of all moderation records',
    type: [ModerationHistory],
    schema: {
      example: [
        {
          id: 1,
          auditorId: 2,
          feedbackId: 1,
          reviewedAt: '2024-01-15T10:30:00.000Z',
          action: 'approved',
          reason: null,
          response: null,
          comments: 'Internal note: Customer complaint about product quality. Escalated to store manager for follow-up.'
        },
        {
          id: 2,
          auditorId: 2,
          feedbackId: 3,
          reviewedAt: '2024-01-15T11:45:00.000Z',
          action: 'rejected',
          reason: 'Inappropriate content',
          response: null,
          comments: 'Internal note: Customer used offensive language. Flagged for review by management.'
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - User does not have auditor role'
  })
  async getAllModerationHistory() {
    return this.moderationService.getAllModerationHistory();
  }

  @Get('feedback/:feedbackId')
  @Roles('auditor')
  @ApiOperation({ 
    summary: 'Get moderation history for a specific feedback',
    description: 'Retrieves all moderation records for a specific feedback ID. Only accessible by auditors.'
  })
  @ApiParam({ 
    name: 'feedbackId', 
    example: 1, 
    description: 'ID of the feedback to get moderation history for',
    type: 'number'
  })
  @ApiProduces('application/json')
  @ApiResponse({ 
    status: 200, 
    description: 'Moderation history for the feedback',
    type: [ModerationHistory],
    schema: {
      example: [
        {
          id: 1,
          auditorId: 2,
          feedbackId: 1,
          reviewedAt: '2024-01-15T10:30:00.000Z',
          action: 'approved',
          reason: null,
          response: null,
          comments: 'Internal note: Customer complaint about product quality. Escalated to store manager for follow-up.'
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - User does not have auditor role'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Feedback not found'
  })
  async getModerationHistoryForFeedback(@Param('feedbackId') feedbackId: number) {
    return this.moderationService.getModerationHistoryForFeedback(+feedbackId);
  }
} 