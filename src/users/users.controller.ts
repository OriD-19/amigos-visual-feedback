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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-role-user.dto';
import { RegisterClientDto } from './dto/create-client.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register/admin')
  @Roles('admin')
  @Permissions('manageUsers')
  @ApiOperation({ summary: 'Create user (admin only)' })
  create(@Req() req, @Body() dto: CreateUserDto) {
    return this.usersService.create(req.user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users (admin only)' })
  findAll(@Req() req) {
    return this.usersService.findAll(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user (admin only)' })
  update(@Req() req, @Param('id') id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user, id, dto);
  }

  @Put(':id/role')
  @ApiOperation({ summary: 'Update user role (admin only)' })
  updateRole(@Req() req, @Param('id') id: number, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.updateRole(req.user, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (admin only)' })
  remove(@Req() req, @Param('id') id: number) {
    return this.usersService.remove(req.user, id);
  }

  @Get('role/:role')
  @ApiOperation({ summary: 'Get users by role (admin only)' })
  findByRole(@Req() req, @Param('role') role: string) {
    return this.usersService.findByRole(req.user, role);
  }

  @Get('sucursal/:id')
  @ApiOperation({ summary: 'Get users by store ID (admin only)' })
  findBySucursal(@Req() req, @Param('id') storeId: number) {
    return this.usersService.findBySucursal(req.user, storeId);
  }
}