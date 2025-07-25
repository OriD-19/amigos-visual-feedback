import { Body, Controller, Get, Param, ParseIntPipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductStoreDto } from './dto/create-product-store.dto';
import { create } from 'domain';
import { CreateProductDto } from './dto/create-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('products')
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
    @ApiOperation({ summary: 'Create a new product and associate it with a store' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      description: 'Product data and optional image',
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Banana' },
          price: { type: 'number', example: 1.99 },
          storeId: { type: 'number', example: 1 },
          stock: { type: 'number', example: 100 },
          image: { type: 'string', format: 'binary', description: 'Product image (optional)' }
        },
        required: ['name', 'price', 'storeId', 'stock']
      }
    })
    @ApiResponse({ status: 201, description: 'Product created successfully' })
    @UseInterceptors(FileInterceptor('image'))
    create(
        @Body() createProductDto: CreateProductDto,
        @UploadedFile() file: Express.Multer.File
    ) {
        return this.productsService.create(createProductDto, file);
    }

    @Get()
    @ApiOperation({ summary: 'Get all products' })
    @ApiResponse({ status: 200, description: 'List of products' })
    findAll() {
        return this.productsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a product by ID' })
    @ApiParam({ name: 'id', example: 1 })
    @ApiResponse({ status: 200, description: 'Product found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id);
    }

    //para asignar productos a las sucursales
    @Post(':id/stores')
    @ApiOperation({ summary: 'Assign a product to a store' })
    @ApiParam({ name: 'id', example: 1 })
    @ApiBody({ type: CreateProductStoreDto })
    @ApiResponse({ status: 201, description: 'Product assigned to store' })
    assignToStore(
        @Param('id', ParseIntPipe) id: number,
        @Body() createProductStore: CreateProductStoreDto,
    ) {
        return this.productsService.assignToStore(id, createProductStore);
    }

    //para ver las sucursales de un producto
    @Get(':id/stores')
    @ApiOperation({ summary: 'Get all stores for a product' })
    @ApiParam({ name: 'id', example: 1 })
    @ApiResponse({ status: 200, description: 'List of stores for the product' })
    getProductStores(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.getProductStores(id);
    }
}
