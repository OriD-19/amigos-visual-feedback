import { ApiProperty } from '@nestjs/swagger';

export class CreateProductStoreDto {
  @ApiProperty({ example: 1, description: 'Store ID' })
  store_id: number;

  @ApiProperty({ example: 50, description: 'Stock to assign to the store' })
  stock: number;
}