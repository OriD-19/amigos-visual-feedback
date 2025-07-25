import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength, MinLength } from "class-validator";

export class CreateProductDto {
    @ApiProperty({ description: 'Product name', example: 'iPhone 15 Pro', minLength: 2, maxLength: 100})
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @ApiProperty({description: 'Product price in USD', example: 78.99, minimum: 0.01})
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    price: number;
}