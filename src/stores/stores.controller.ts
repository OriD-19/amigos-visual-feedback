import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
@Controller('stores')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class StoresController {
    constructor(private readonly storesService: StoresService) { }

    @ApiOperation({ summary: 'Create a new store' })
    @ApiResponse({ status: 201, description: 'Store created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' }) 
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Post()
    create(@Body() createStoreDto: CreateStoreDto) {
        return this.storesService.create(createStoreDto)
    }

    @ApiOperation({ summary: 'Get all stores' })
    @ApiResponse({ status: 200, description: 'Stores fetched successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Get()
    findAll() {
        return this.storesService.findAll();
    }

    @ApiOperation({ summary: 'Get a store by ID' })
    @ApiResponse({ status: 200, description: 'Store fetched successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.storesService.findOne(id);
    }

    @ApiOperation({ summary: 'Get products of a store' })
    @ApiResponse({ status: 200, description: 'Products fetched successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Get(':id/products')
    getStoreProducts(@Param('id', ParseIntPipe) storeId: number) {
        return this.storesService.getStoreProducts(storeId);
    }

}
