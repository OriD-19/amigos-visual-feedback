import { Body, Controller, Get, Param, ParseIntPipe, Post, UploadedFile, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductStoreDto } from './dto/create-product-store.dto';
import { create } from 'domain';
import { CreateProductDto } from './dto/create-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiParam, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
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
    @ApiOperation({ summary: 'Get all products' })
    @ApiResponse({ status: 200, description: 'List of products' })
    @Roles('admin', 'manager')
    @Permissions('createProduct')
    @ApiOperation({
        summary: 'Crear producto',
        description: 'Requiere permiso: createProduct. Solo admin o manager.'
    })
    @ApiBody({
        type: CreateProductDto,
        description: 'Product data to create'
    })
    @ApiCreatedResponse({
        description: 'Product created successfully',
        schema: {
            example: {
                id: 1,
                name: 'Sample Product',
                description: 'Product description',
                price: 99.99,
                createdAt: '2025-07-24T10:00:00.000Z'
            }
        }
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data',
        schema: {
            example: {
                statusCode: 400,
                message: ['name should not be empty', 'price must be a positive number'],
                error: 'Bad Request'
            }
        }
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid or missing authentication token'
    })
    @ApiForbiddenResponse({
        description: 'Insufficient permissions to perform this action'
    })
    @UseInterceptors(FileInterceptor('image'))
    create(@Req() req, @Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all products',
        description: 'Returns a list of all available products in the system.'
    })
    @ApiOkResponse({
        description: 'Products list retrieved successfully',
        schema: {
            example: [
                {
                    id: 1,
                    name: 'Product 1',
                    description: 'Product 1 description',
                    price: 99.99,
                    createdAt: '2025-07-24T10:00:00.000Z'
                },
                {
                    id: 2,
                    name: 'Product 2',
                    description: 'Product 2 description',
                    price: 149.99,
                    createdAt: '2025-07-24T11:00:00.000Z'
                }
            ]
        }
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid or missing authentication token'
    })
    findAll() {
        return this.productsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a product by ID' })
    @ApiParam({ name: 'id', example: 1 })
    @ApiResponse({ status: 200, description: 'Product found' })
    @ApiOperation({
        summary: 'Get product by ID',
        description: 'Returns the details of a specific product based on its ID.'
    })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'Unique product ID',
        example: 1
    })
    @ApiOkResponse({
        description: 'Product found successfully',
        schema: {
            example: {
                id: 1,
                name: 'Sample Product',
                description: 'Product description',
                price: 99.99,
                createdAt: '2025-07-24T10:00:00.000Z'
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'Product not found',
        schema: {
            example: {
                statusCode: 404,
                message: 'Product with ID 1 not found',
                error: 'Not Found'
            }
        }
    })
    @ApiBadRequestResponse({
        description: 'Invalid ID',
        schema: {
            example: {
                statusCode: 400,
                message: 'Validation failed (numeric string is expected)',
                error: 'Bad Request'
            }
        }
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid or missing authentication token'
    })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id);
    }

    @Post(':id/stores')
    @ApiOperation({ summary: 'Assign a product to a store' })
    @ApiParam({ name: 'id', example: 1 })
    @ApiBody({ type: CreateProductStoreDto })
    @ApiResponse({ status: 201, description: 'Product assigned to store' })
    @UseGuards(PermissionsGuard)
    @Permissions('assignProductToStore')
    @ApiOperation({
        summary: 'Assign product to store',
        description: 'Assigns an existing product to a specific store. Requires permission: assignProductToStore. Only users with ADMIN or MANAGER role can perform this action.'
    })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'Product ID to assign',
        example: 1
    })
    @ApiBody({
        type: CreateProductStoreDto,
        description: 'Product-store assignment data'
    })
    @ApiCreatedResponse({
        description: 'Product assigned to store successfully',
        schema: {
            example: {
                id: 1,
                productId: 1,
                storeId: 2,
                stock: 100,
                price: 99.99,
                createdAt: '2025-07-24T10:00:00.000Z'
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'Product not found',
        schema: {
            example: {
                statusCode: 404,
                message: 'Product with ID 1 not found',
                error: 'Not Found'
            }
        }
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data or product already assigned to store',
        schema: {
            example: {
                statusCode: 400,
                message: 'Product is already assigned to this store',
                error: 'Bad Request'
            }
        }
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid or missing authentication token'
    })
    @ApiForbiddenResponse({
        description: 'Insufficient permissions to perform this action'
    })
    assignToStore(
        @Param('id', ParseIntPipe) id: number,
        @Body() createProductStore: CreateProductStoreDto,
    ) {
        return this.productsService.assignToStore(id, createProductStore);
    }

    @Get(':id/stores')
    @ApiOperation({
        summary: 'Get product stores',
        description: 'Returns all stores where a specific product is available, including stock and prices.'
    })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'Product ID',
        example: 1
    })
    @ApiOkResponse({
        description: 'Product stores retrieved successfully',
        schema: {
            example: [
                {
                    id: 1,
                    productId: 1,
                    storeId: 2,
                    store: {
                        id: 2,
                        name: 'Downtown Store',
                        address: '123 Main Street'
                    },
                    stock: 100,
                    price: 99.99,
                    createdAt: '2025-07-24T10:00:00.000Z'
                },
                {
                    id: 2,
                    productId: 1,
                    storeId: 3,
                    store: {
                        id: 3,
                        name: 'North Store',
                        address: '456 North Avenue'
                    },
                    stock: 50,
                    price: 99.99,
                    createdAt: '2025-07-24T11:00:00.000Z'
                }
            ]
        }
    })
    @ApiNotFoundResponse({
        description: 'Product not found',
        schema: {
            example: {
                statusCode: 404,
                message: 'Product with ID 1 not found',
                error: 'Not Found'
            }
        }
    })
    @ApiBadRequestResponse({
        description: 'Invalid ID',
        schema: {
            example: {
                statusCode: 400,
                message: 'Validation failed (numeric string is expected)',
                error: 'Bad Request'
            }
        }
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid or missing authentication token'
    })
    getProductStores(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.getProductStores(id);
    }
}
