import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ModerationHistoryService } from './moderation-history.service';
import { ModerationHistory } from './moderation-history.entity';
import { Feedback } from '../comentario/feedback.entity';
import { User } from '../users/entities/user.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('ModerationHistoryService', () => {
  let service: ModerationHistoryService;
  const mockModerationRepo = { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn() };
  const mockFeedbackRepo = { findOne: jest.fn() };
  const mockUserRepo = { findOne: jest.fn() };
  const mockManager = { id: 1, role: 'manager' } as User;
  const mockFeedback = { id: 10 } as Feedback;
  const mockModeration = { id: 100, auditor: mockManager, auditorId: 1, feedback: mockFeedback, feedbackId: 10, action: 'approved', reviewedAt: new Date() } as ModerationHistory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModerationHistoryService,
        { provide: getRepositoryToken(ModerationHistory), useValue: mockModerationRepo },
        { provide: getRepositoryToken(Feedback), useValue: mockFeedbackRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<ModerationHistoryService>(ModerationHistoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createModeration', () => {
    beforeEach(() => {
      mockFeedbackRepo.findOne.mockResolvedValue(mockFeedback);
      mockUserRepo.findOne.mockResolvedValue(mockManager);
      mockModerationRepo.create.mockReturnValue(mockModeration);
      mockModerationRepo.save.mockResolvedValue(mockModeration);
    });

    it('should allow manager to create moderation record', async () => {
      const jwtPayload = { userId: 1, role: 'manager' };
      const result = await service.createModeration(jwtPayload, 10, 'approved', 'Looks good', 'Thank you', 'Internal note');
      expect(result).toEqual(mockModeration);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockModerationRepo.create).toHaveBeenCalledWith({
        auditor: mockManager,
        auditorId: mockManager.id,
        feedback: mockFeedback,
        feedbackId: 10,
        action: 'approved',
        reason: 'Looks good',
        response: 'Thank you',
        comments: 'Internal note',
      });
    });

    it('should forbid non-manager from creating moderation record', async () => {
      const nonManager = { userId: 2, role: 'cliente' };
      await expect(service.createModeration(nonManager, 10, 'approved')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when feedback not found', async () => {
      mockFeedbackRepo.findOne.mockResolvedValue(null);
      const jwtPayload = { userId: 1, role: 'manager' };
      await expect(service.createModeration(jwtPayload, 999, 'approved')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when auditor user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      const jwtPayload = { userId: 999, role: 'manager' };
      await expect(service.createModeration(jwtPayload, 10, 'approved')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getModerationHistoryForFeedback', () => {
    it('should return moderation history for feedback', async () => {
      const mockHistory = [mockModeration];
      mockModerationRepo.find.mockResolvedValue(mockHistory);
      const result = await service.getModerationHistoryForFeedback(10);
      expect(result).toEqual(mockHistory);
      expect(mockModerationRepo.find).toHaveBeenCalledWith({ where: { feedbackId: 10 } });
    });
  });

  describe('getAllModerationHistory', () => {
    it('should return all moderation history', async () => {
      const mockHistory = [mockModeration];
      mockModerationRepo.find.mockResolvedValue(mockHistory);
      const result = await service.getAllModerationHistory();
      expect(result).toEqual(mockHistory);
      expect(mockModerationRepo.find).toHaveBeenCalledWith();
    });
  });
}); 