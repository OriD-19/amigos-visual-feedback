import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards, Req } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwtAuth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('stores')
@Controller('stores')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
@Roles('admin', 'manager')
export class StoresController {
    constructor(private readonly storesService: StoresService) { }

    @ApiOperation({ summary: 'Create a new store' })
    @ApiResponse({ status: 201, description: 'Store created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' }) 
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Post()
    @ApiOperation({ summary: 'Create a new store' })
    @ApiBody({ type: CreateStoreDto })
    @ApiResponse({ status: 201, description: 'Store created successfully' })
    create(@Req() req, @Body() createStoreDto: CreateStoreDto) {
        return this.storesService.create(createStoreDto, req.user)
    }

    @ApiOperation({ summary: 'Get all stores' })
    @ApiResponse({ status: 200, description: 'Stores fetched successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Get()
    @ApiOperation({ summary: 'Get all stores' })
    @ApiResponse({ status: 200, description: 'List of stores' })
    findAll() {
        return this.storesService.findAll();
    }

    @ApiOperation({ summary: 'Get a store by ID' })
    @ApiResponse({ status: 200, description: 'Store fetched successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Get(':id')
    @ApiOperation({ summary: 'Get a store by ID' })
    @ApiParam({ name: 'id', example: 1 })
    @ApiResponse({ status: 200, description: 'Store found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.storesService.findOne(id);
    }

    @ApiOperation({ summary: 'Get products of a store' })
    @ApiResponse({ status: 200, description: 'Products fetched successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Get(':id/products')
    @ApiOperation({ summary: 'Get all products for a store' })
    @ApiParam({ name: 'id', example: 1 })
    @ApiResponse({ status: 200, description: 'List of products for the store' })
    getStoreProducts(@Param('id', ParseIntPipe) storeId: number) {
        return this.storesService.getStoreProducts(storeId);
    }
}
