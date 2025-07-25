import { Body, Controller, Post, Request, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  password: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService,
        private readonly usersService: UsersService) { }

    @Post('register')
    @ApiOperation({ summary: 'Client registration (public, only customers can self-register)' })
    @ApiResponse({ status: 201, description: 'Client registered successfully' })
    @ApiResponse({ status: 400, description: 'Error registering client' })
    async register(@Body() createUserDto: CreateUserDto) {
        if (createUserDto.role && createUserDto.role !== 'cliente') {
            throw new ForbiddenException('Only customer (cliente) role can be self-registered.');
        }
        // hash the password before saving to the database
        createUserDto.password = await bcrypt.hash(createUserDto.password, 12);
        createUserDto.role = 'cliente';
        return this.usersService.registerClient(createUserDto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login a user' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'User logged in successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid email or password' })
    async login(@Body() body: LoginDto) {
        const { email, password } = body;
        const user = await this.authService.validateUser(email, password);
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }
        return this.authService.login(user);
    }
}
