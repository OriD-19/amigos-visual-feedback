import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsIn, IsString, IsNumber } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

const VALID_ROLES = ['cliente', 'admin', 'manager'];

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsOptional()
    @IsString()
    @IsIn(VALID_ROLES)
    role?: string;

    @IsOptional()
    @IsNumber()
    storeId?: number;
}