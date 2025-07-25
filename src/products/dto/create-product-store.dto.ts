import { ApiProperty } from "@nestjs/swagger";

export class CreateProductStoreDto {
    @ApiProperty({ description: 'The unique identifier of the product',})
    store_id: number;
    @ApiProperty({ description: 'Quantity of products available',})
    stock: number;
}