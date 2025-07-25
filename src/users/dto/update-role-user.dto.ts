import { IsNotEmpty, IsString, IsIn, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const VALID_ROLES = ['cliente', 'admin', 'manager'];

export class UpdateUserRoleDto {
    @ApiProperty({ example: 'manager', enum: VALID_ROLES, description: 'Role to assign to the user' })
    @IsString()
    @IsNotEmpty()
    @IsIn(VALID_ROLES)
    role: string;

    @ApiPropertyOptional({ example: 1, description: 'Store ID (only for managers)' })
    @IsOptional()
    @IsNumber()
    storeId?: number; // Solo para managers
}