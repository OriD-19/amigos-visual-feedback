import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findOneByEmail: jest.fn(),
  };
  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const user = { id: 1, email: 'test@example.com', password: 'hashed', name: 'Test', role: 'cliente' };
      mockUsersService.findOneByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt as any, 'compare').mockResolvedValue(true);
      const result = await service.validateUser('test@example.com', '1234');
      expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual({ id: 1, email: 'test@example.com', name: 'Test', role: 'cliente' });
    });

    it('should return null if user is not found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      const result = await service.validateUser('notfound@example.com', '1234');
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      const user = { id: 1, email: 'test@example.com', password: 'hashed', name: 'Test', role: 'cliente' };
      mockUsersService.findOneByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt as any, 'compare').mockResolvedValue(false);
      const result = await service.validateUser('test@example.com', 'wrong');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access_token and user', async () => {
      const user = { id: 1, email: 'test@example.com', name: 'Test', role: 'cliente' };
      mockJwtService.sign.mockReturnValue('jwt-token');
      const result = await service.login(user);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
        userId: user.id,
        name: user.name,
        role: user.role,
      });
      expect(result).toEqual({ access_token: 'jwt-token', user });
    });
  });
});
