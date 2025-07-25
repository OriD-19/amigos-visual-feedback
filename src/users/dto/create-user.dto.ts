import { IsEmail, IsString, IsNotEmpty, IsOptional, IsNumber, MinLength, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const VALID_ROLES = ['cliente', 'admin', 'manager'];

export class CreateUserDto {
    @ApiProperty({ example: 'John', description: 'First name of the user' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'Doe', description: 'Last name of the user' })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiProperty({ example: 'john@example.com', description: 'Email address of the user' })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({ example: 12345678, description: 'DUI number of the user' })
    @IsOptional()
    @IsNumber()
    dui?: number;

    @ApiProperty({ example: 'password123', minLength: 6, description: 'Password for the user' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'cliente', enum: VALID_ROLES, description: 'Role of the user' })
    @IsString()
    @IsIn(VALID_ROLES)
    role: string;

    @ApiPropertyOptional({ example: 1, description: 'Store ID (required for managers)' })
    @IsOptional()
    @IsNumber()
    storeId?: number; // Requerido solo para managers
}
