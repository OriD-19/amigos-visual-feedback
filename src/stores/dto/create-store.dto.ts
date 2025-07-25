import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreDto {
  @ApiProperty({ example: 'Central Branch', description: 'Store name' })
  name: string;

  @ApiProperty({ example: '123 Main St', description: 'Store address' })
  direction: string;
}