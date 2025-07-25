import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Store } from '../stores/store.entity/store.entity';
import * as bcrypt from 'bcrypt';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepo: any;
  let storeRepo: any;

  const mockUser = { id: 1, email: 'test@example.com', password: 'hashed', role: 'admin', name: 'Test' };
  const mockStore = { id: 1, name: 'Main Store' };

  const usersRepoMock = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    find: jest.fn(),
  };
  const storeRepoMock = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    Object.values(usersRepoMock).forEach(fn => fn.mockReset && fn.mockReset());
    Object.values(storeRepoMock).forEach(fn => fn.mockReset && fn.mockReset());
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepoMock },
        { provide: getRepositoryToken(Store), useValue: storeRepoMock },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    usersRepo = usersRepoMock;
    storeRepo = storeRepoMock;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByEmail', () => {
    it('should return a user by email', async () => {
      usersRepo.findOne.mockResolvedValue(mockUser);
      const result = await service.findOneByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('registerClient', () => {
    it('should register a new client', async () => {
      usersRepo.findOne.mockResolvedValue(null);
      usersRepo.create.mockReturnValue({ ...mockUser, role: 'cliente' });
      usersRepo.save.mockResolvedValue({ ...mockUser, role: 'cliente' });
      jest.spyOn(bcrypt as any, 'hash').mockResolvedValue('hashed');
      const dto = { email: 'test@example.com', password: '1234', name: 'Test' };
      const result = await service.registerClient(dto as any);
      expect(result).toMatchObject({ email: dto.email, role: 'cliente' });
    });
    it('should throw if email exists', async () => {
      usersRepo.findOne.mockResolvedValue(mockUser);
      await expect(service.registerClient({ email: 'test@example.com', password: '1234', name: 'Test' } as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    it('should create a user as admin', async () => {
      usersRepo.findOne.mockResolvedValue(null);
      storeRepo.findOne.mockResolvedValue(mockStore);
      usersRepo.create.mockImplementation((dto) => ({ ...dto, id: 2, password: 'hashed' }));
      usersRepo.save.mockImplementation((user) => user);
      jest.spyOn(bcrypt as any, 'hash').mockResolvedValue('hashed');
      const requester = { role: 'admin' };
      const dto = { email: 'test2@example.com', password: '1234', name: 'Test2', role: 'manager', storeId: 1 };
      const result = await service.create(requester as any, dto as any);
      expect(result).toMatchObject({ email: dto.email });
    });
    it('should throw if email exists', async () => {
      usersRepo.findOne.mockResolvedValue(mockUser);
      const requester = { role: 'admin' };
      const dto = { email: 'test@example.com', password: '1234', name: 'Test', role: 'manager', storeId: 1 };
      await expect(service.create(requester as any, dto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      usersRepo.findOne.mockResolvedValue(mockUser);
      const result = await service.findOne(1);
      expect(result).toMatchObject({ id: 1 });
    });
    it('should throw if user not found', async () => {
      usersRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      usersRepo.update.mockResolvedValue(undefined);
      usersRepo.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt as any, 'hash').mockResolvedValue('hashed');
      const requester = { role: 'admin' };
      const dto = { name: 'Updated' };
      const result = await service.update(requester as any, 1, dto as any);
      expect(result).toMatchObject({ id: 1 });
    });
  });

  describe('updateRole', () => {
    it('should update a user role', async () => {
      usersRepo.update.mockResolvedValue(undefined);
      usersRepo.findOne.mockResolvedValue(mockUser);
      const requester = { role: 'admin' };
      const dto = { role: 'manager', storeId: 1 };
      const result = await service.updateRole(requester as any, 1, dto as any);
      expect(result).toMatchObject({ id: 1 });
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      usersRepo.findOne.mockResolvedValue(mockUser);
      usersRepo.remove.mockResolvedValue(undefined);
      const requester = { role: 'admin' };
      await expect(service.remove(requester as any, 1)).resolves.toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      usersRepo.find.mockResolvedValue([mockUser]);
      const requester = { role: 'admin' };
      const result = await service.findAll(requester as any);
      expect(result).toEqual([expect.objectContaining({ id: 1 })]);
    });
  });

  describe('findByRole', () => {
    it('should return users by role', async () => {
      usersRepo.find.mockResolvedValue([mockUser]);
      const requester = { role: 'admin' };
      const result = await service.findByRole(requester as any, 'admin');
      expect(result).toEqual([expect.objectContaining({ role: 'admin' })]);
    });
  });

  describe('findBySucursal', () => {
    it('should return users by storeId', async () => {
      usersRepo.find.mockResolvedValue([mockUser]);
      const requester = { role: 'admin' };
      const result = await service.findBySucursal(requester as any, 1);
      expect(result).toEqual([expect.objectContaining({ id: 1 })]);
    });
  });
});
