import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;
  let usersService: UsersService;
  let authService: AuthService;

  const mockUsersService = {
    registerClient: jest.fn(),
  };
  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: { sign: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a client and return the user', async () => {
      const dto = { email: 'test@example.com', password: '1234', name: 'Test', lastName: 'User', role: 'cliente' };
      const hashedPassword = 'hashed';
      const expectedUser = { id: 1, email: dto.email, name: dto.name, lastName: dto.lastName, role: 'cliente' };
      // Forzar el tipo any para evitar error de tipo 'never' en jest.spyOn
      jest.spyOn(bcrypt as any, 'hash').mockResolvedValue(hashedPassword);
      mockUsersService.registerClient.mockResolvedValue(expectedUser);

      const result = await controller.register({ ...dto });
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 12);
      expect(mockUsersService.registerClient).toHaveBeenCalledWith({ ...dto, password: hashedPassword, role: 'cliente' });
      expect(result).toEqual(expectedUser);
    });
  });

  describe('login', () => {
    it('should login a user and return access token', async () => {
      const body = { email: 'test@example.com', password: '1234' };
      const user = { id: 1, email: body.email, name: 'Test', role: 'cliente' };
      const token = { access_token: 'jwt', user };
      mockAuthService.validateUser.mockResolvedValue(user);
      mockAuthService.login.mockResolvedValue(token);

      const result = await controller.login(body);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(body.email, body.password);
      expect(mockAuthService.login).toHaveBeenCalledWith(user);
      expect(result).toEqual(token);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const body = { email: 'wrong@example.com', password: 'wrong' };
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(body)).rejects.toThrow('Invalid email or password');
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(body.email, body.password);
    });
  });
});
