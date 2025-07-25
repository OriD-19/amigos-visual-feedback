import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsIn, IsString, IsNumber } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

const VALID_ROLES = ['cliente', 'admin', 'manager'];

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiPropertyOptional({ example: 'cliente', enum: VALID_ROLES, description: 'Role of the user' })
    @IsOptional()
    @IsString()
    @IsIn(VALID_ROLES)
    role?: string;

    @ApiPropertyOptional({ example: 1, description: 'Store ID (optional, only for managers)' })
    @IsOptional()
    @IsNumber()
    storeId?: number;
}