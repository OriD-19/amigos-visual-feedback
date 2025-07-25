import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-role-user.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import * as bcrypt from "bcrypt";
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { JwtAuthGuard } from '../auth/jwtAuth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Public registration endpoint
  @Post()
  @ApiOperation({ summary: 'Create a new user (only customers can self-register)' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async create(@Req() req, @Body() createUserDto: CreateUserDto) {
    if (createUserDto.role && createUserDto.role !== 'cliente') {
      throw new ForbiddenException('Only customer (cliente) role can be self-registered.');
    }
    createUserDto.role = 'cliente'; // enforce role
    createUserDto.password = await bcrypt.hash(createUserDto.password, 12);
    return this.usersService.create(req.user, createUserDto);
  }

  // Admin registration endpoint
  @Post('register/admin')
  @Roles('admin')
  @Permissions('manageUsers')
  @ApiOperation({ summary: 'Create user (admin only)' })
  async createAdmin(@Req() req, @Body() dto: CreateUserDto) {
    return this.usersService.create(req.user, dto);
  }

  // Get all users (admin only)
  @Get()
  @Roles('admin')
  @Permissions('manageUsers')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({ status: 200, description: 'List of users' })
  findAll(@Req() req) {
    return this.usersService.findAll(req.user);
  }

  // Get user by ID (admin only)
  @Get(':id')
  @Roles('admin')
  @Permissions('manageUsers')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'User found' })
  findOne(@Req() req, @Param('id') id: number) {
    return this.usersService.findOne(+id);
  }

  // Update a user (admin only)
  @Put(':id')
  @Roles('admin')
  @Permissions('manageUsers')
  @ApiOperation({ summary: 'Update a user (admin only)' })
  update(@Req() req, @Param('id') id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user, +id, dto);
  }

  // Update user role (admin only)
  @Put(':id/role')
  @Roles('admin')
  @Permissions('manageUsers')
  @ApiOperation({ summary: 'Update user role (admin only)' })
  updateRole(@Req() req, @Param('id') id: number, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.updateRole(req.user, +id, dto);
  }

  // Delete user (admin only)
  @Delete(':id')
  @Roles('admin')
  @Permissions('manageUsers')
  @ApiOperation({ summary: 'Delete user (admin only)' })
  remove(@Req() req, @Param('id') id: number) {
    return this.usersService.remove(req.user, +id);
  }

  // Get users by role (admin only)
  @Get('role/:role')
  @Roles('admin')
  @Permissions('manageUsers')
  @ApiOperation({ summary: 'Get users by role (admin only)' })
  findByRole(@Req() req, @Param('role') role: string) {
    return this.usersService.findByRole(req.user, role);
  }

  // Get users by store ID (admin only)
  @Get('sucursal/:id')
  @Roles('admin')
  @Permissions('manageUsers')
  @ApiOperation({ summary: 'Get users by store ID (admin only)' })
  findBySucursal(@Req() req, @Param('id') storeId: number) {
    return this.usersService.findBySucursal(req.user, +storeId);
  }
}
