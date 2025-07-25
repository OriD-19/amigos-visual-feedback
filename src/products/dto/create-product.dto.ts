import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Banana', description: 'Name of the product' })
  name: string;

  @ApiProperty({ example: 1.99, description: 'Price of the product' })
  price: number;

  @ApiProperty({ example: 'https://storage.googleapis.com/bucket/image.jpg', required: false, description: 'Image URL (optional, set by server)' })
  imageUrl?: string;

  @ApiProperty({ example: 1, description: 'Store ID to associate the product with' })
  storeId: number;

  @ApiProperty({ example: 100, description: 'Initial stock for the product in the store' })
  stock: number;
}