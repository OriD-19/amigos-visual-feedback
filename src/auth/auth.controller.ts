import { Body, Controller, Post, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { RoleValidator } from '../auth/helpers/role-validator.helper';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService,
        private readonly usersService: UsersService) { }

    @Post('register')
    @ApiOperation({ summary: 'Client registration (public)' })
    @ApiResponse({ status: 201, description: 'Client registered successfully' })
    @ApiResponse({ status: 400, description: 'Error registering client' })
    async register(@Body() createUserDto: CreateUserDto) {
        createUserDto.password = await bcrypt.hash(createUserDto.password, 12);
        // Forzar rol cliente
        createUserDto.role = 'cliente';
        return this.usersService.registerClient(createUserDto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login a user' })
    @ApiResponse({ status: 200, description: 'User logged in successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid email or password' })
    async login(@Body() body: { email: string, password: string }) {
        const { email, password } = body;
        const user = await this.authService.validateUser(email, password);
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }
        return this.authService.login(user);
    }
}
