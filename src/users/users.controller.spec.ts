import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = { id: 1, role: 'admin', name: 'Admin', email: 'admin@example.com' };
  const mockReq = { user: mockUser };
  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateRole: jest.fn(),
    remove: jest.fn(),
    findByRole: jest.fn(),
    findBySucursal: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto = { name: 'Test', email: 'test@example.com', password: '1234', role: 'cliente' };
      const hashed = 'hashed';
      const expected = { id: 2, ...dto };
      jest.spyOn(bcrypt as any, 'hash').mockResolvedValue(hashed);
      mockUsersService.create.mockResolvedValue(expected);
      const result = await controller.create(mockReq, { ...dto });
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 12);
      expect(service.create).toHaveBeenCalledWith(mockUser, { ...dto, password: hashed });
      expect(result).toEqual(expected);
    });
  });

  describe('createAdmin', () => {
    it('should create an admin user', async () => {
      const dto = { name: 'Admin2', email: 'admin2@example.com', password: 'adminpass', role: 'admin' };
      const expected = { id: 3, ...dto };
      mockUsersService.create.mockResolvedValue(expected);
      const result = await controller.createAdmin(mockReq, dto);
      expect(service.create).toHaveBeenCalledWith(mockUser, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const expected = [{ id: 1, name: 'A' }];
      mockUsersService.findAll.mockResolvedValue(expected);
      const result = await controller.findAll(mockReq);
      expect(service.findAll).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const expected = { id: 1, name: 'A' };
      mockUsersService.findOne.mockResolvedValue(expected);
      const result = await controller.findOne(mockReq, 1);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const dto = { name: 'Updated' };
      const expected = { id: 1, name: 'Updated' };
      mockUsersService.update.mockResolvedValue(expected);
      const result = await controller.update(mockReq, 1, dto);
      expect(service.update).toHaveBeenCalledWith(mockUser, 1, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('updateRole', () => {
    it('should update a user role', async () => {
      const dto = { role: 'manager', storeId: 2 };
      const expected = { id: 1, role: 'manager', storeId: 2 };
      mockUsersService.updateRole.mockResolvedValue(expected);
      const result = await controller.updateRole(mockReq, 1, dto);
      expect(service.updateRole).toHaveBeenCalledWith(mockUser, 1, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);
      const result = await controller.remove(mockReq, 1);
      expect(service.remove).toHaveBeenCalledWith(mockUser, 1);
      expect(result).toBeUndefined();
    });
  });

  describe('findByRole', () => {
    it('should return users by role', async () => {
      const expected = [{ id: 2, role: 'manager' }];
      mockUsersService.findByRole.mockResolvedValue(expected);
      const result = await controller.findByRole(mockReq, 'manager');
      expect(service.findByRole).toHaveBeenCalledWith(mockUser, 'manager');
      expect(result).toEqual(expected);
    });
  });

  describe('findBySucursal', () => {
    it('should return users by storeId', async () => {
      const expected = [{ id: 2, storeId: 1 }];
      mockUsersService.findBySucursal.mockResolvedValue(expected);
      const result = await controller.findBySucursal(mockReq, 1);
      expect(service.findBySucursal).toHaveBeenCalledWith(mockUser, 1);
      expect(result).toEqual(expected);
    });
  });
});
