import { IsNotEmpty, IsString, IsIn, IsOptional, IsNumber } from 'class-validator';

const VALID_ROLES = ['cliente', 'admin', 'manager'];

export class UpdateUserRoleDto {
    @IsString()
    @IsNotEmpty()
    @IsIn(VALID_ROLES)
    role: string;

    @IsOptional()
    @IsNumber()
    storeId?: number; // Solo para managers
}