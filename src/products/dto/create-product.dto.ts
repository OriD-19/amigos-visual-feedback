export class CreateProductDto {
    name: string;
    price: number;
    imageUrl?: string;
    storeId: number;
    stock: number;
}