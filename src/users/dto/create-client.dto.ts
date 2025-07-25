import { IsNotEmpty, IsEmail, IsString, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class RegisterClientDto {
    @ApiProperty({ example: 'John', description: 'First name of the client' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'john@example.com', description: 'Email address of the client' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', minLength: 6, description: 'Password for the client' })
    @IsString()
    @MinLength(6)
    password: string;
}
