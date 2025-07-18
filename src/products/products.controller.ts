import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductStoreDto } from './dto/create-product-store.dto';
import { create } from 'domain';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @Get()
    findAll() {
        return this.productsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id);
    }

    //para asignar productos a las sucursales
    @Post(':id/stores')
    assignToStore(
        @Param('id', ParseIntPipe) id: number,
        @Body() createProductStore: CreateProductStoreDto,
    ) {
        return this.productsService.assignToStore(id, createProductStore);
    }

    //para ver las sucursales de un producto
    @Get(':id/stores')
    getProductStores(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.getProductStores(id);
    }

}
