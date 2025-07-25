import { IsEmail, IsString, IsNotEmpty, IsOptional, IsNumber, MinLength, IsIn } from 'class-validator';

const VALID_ROLES = ['cliente', 'admin', 'manager'];

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsNumber()
    dui?: number;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @IsIn(VALID_ROLES)
    role: string;

    @IsOptional()
    @IsNumber()
    storeId?: number; // Requerido solo para managers
}
