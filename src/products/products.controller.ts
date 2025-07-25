import { Body, Controller, Get, Param, ParseIntPipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductStoreDto } from './dto/create-product-store.dto';
import { create } from 'domain';
import { CreateProductDto } from './dto/create-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    /**
     * Create a new product and associate it with a store.
     *
     * Required fields in multipart/form-data:
     * - name: string
     * - price: number
     * - storeId: number (store to associate the product with)
     * - image: file (optional)
     */
    @Post()
    @UseInterceptors(FileInterceptor('image'))
    create(
        @Body() createProductDto: CreateProductDto,
        @UploadedFile() file: Express.Multer.File
    ) {
        return this.productsService.create(createProductDto, file);
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
