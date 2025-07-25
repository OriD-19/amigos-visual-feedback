import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStoreDto {
    @ApiProperty({ description: 'Name of the store' })
    name: string;

    @ApiProperty({ description: 'Direction/address of the store' })
    direction: string;

    @ApiPropertyOptional({ description: 'ID of the User who is the manager of the store (set automatically from authenticated user)', example: 1 })
    managerId?: number;
}