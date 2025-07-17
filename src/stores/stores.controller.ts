import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';

@Controller('stores')
export class StoresController {
    constructor(private readonly storesService: StoresService) { }

    @Post()
    create(@Body() createStoreDto: CreateStoreDto) {
        return this.storesService.create(createStoreDto)
    }

    @Get()
    findAll() {
        return this.storesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.storesService.findOne(id);
    }

    @Get(':id/products')
    getStoreProducts(@Param('id', ParseIntPipe) storeId: number) {
        return this.storesService.getStoreProducts(storeId);
    }

}
