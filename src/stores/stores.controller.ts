import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('stores')
@Controller('stores')
export class StoresController {
    constructor(private readonly storesService: StoresService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new store' })
    @ApiBody({ type: CreateStoreDto })
    @ApiResponse({ status: 201, description: 'Store created successfully' })
    create(@Body() createStoreDto: CreateStoreDto) {
        return this.storesService.create(createStoreDto)
    }

    @Get()
    @ApiOperation({ summary: 'Get all stores' })
    @ApiResponse({ status: 200, description: 'List of stores' })
    findAll() {
        return this.storesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a store by ID' })
    @ApiParam({ name: 'id', example: 1 })
    @ApiResponse({ status: 200, description: 'Store found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.storesService.findOne(id);
    }

    @Get(':id/products')
    @ApiOperation({ summary: 'Get all products for a store' })
    @ApiParam({ name: 'id', example: 1 })
    @ApiResponse({ status: 200, description: 'List of products for the store' })
    getStoreProducts(@Param('id', ParseIntPipe) storeId: number) {
        return this.storesService.getStoreProducts(storeId);
    }
}
