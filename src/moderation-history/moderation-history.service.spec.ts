import { Test, TestingModule } from '@nestjs/testing';
import { ModerationHistoryService } from './moderation-history.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ModerationHistory } from './moderation-history.entity';
import { Feedback } from '../comentario/feedback.entity';
import { User } from '../users/entities/user.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const mockAuditor = { id: 1, role: 'auditor' } as User;
const mockCustomer = { id: 2, role: 'cliente' } as User;
const mockFeedback = { id: 10 } as Feedback;
const mockModeration = { id: 100, auditor: mockAuditor, auditorId: 1, feedback: mockFeedback, feedbackId: 10, action: 'approved', reviewedAt: new Date() } as ModerationHistory;

const moderationRepo = {
  create: jest.fn().mockReturnValue(mockModeration),
  save: jest.fn().mockResolvedValue(mockModeration),
  find: jest.fn().mockResolvedValue([mockModeration]),
};
const feedbackRepo = {
  findOne: jest.fn().mockResolvedValue(mockFeedback),
};
const userRepo = {};

describe('ModerationHistoryService', () => {
  let service: ModerationHistoryService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModerationHistoryService,
        { provide: getRepositoryToken(ModerationHistory), useValue: moderationRepo },
        { provide: getRepositoryToken(Feedback), useValue: feedbackRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();
    service = module.get<ModerationHistoryService>(ModerationHistoryService);
  });

  it('should allow auditor to create moderation record', async () => {
    feedbackRepo.findOne.mockResolvedValueOnce(mockFeedback);
    const result = await service.createModeration(mockAuditor, 10, 'approved', 'Looks good', 'Thank you');
    expect(result).toEqual(mockModeration);
    expect(moderationRepo.save).toHaveBeenCalled();
  });

  it('should forbid non-auditor from creating moderation record', async () => {
    await expect(service.createModeration(mockCustomer, 10, 'approved')).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException if feedback does not exist', async () => {
    feedbackRepo.findOne.mockResolvedValueOnce(undefined);
    await expect(service.createModeration(mockAuditor, 999, 'approved')).rejects.toThrow(NotFoundException);
  });

  it('should get all moderation history', async () => {
    moderationRepo.find.mockResolvedValueOnce([mockModeration]);
    const result = await service.getAllModerationHistory();
    expect(result).toEqual([mockModeration]);
  });

  it('should get moderation history for a specific feedback', async () => {
    moderationRepo.find.mockResolvedValueOnce([mockModeration]);
    const result = await service.getModerationHistoryForFeedback(10);
    expect(result).toEqual([mockModeration]);
    expect(moderationRepo.find).toHaveBeenCalledWith({ where: { feedbackId: 10 } });
  });
}); 