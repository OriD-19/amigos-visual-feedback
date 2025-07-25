import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterClientDto } from './dto/create-client.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-role-user.dto';
import { Store } from '../stores/store.entity/store.entity';
import * as bcrypt from 'bcrypt';
import { RoleValidator } from '../auth/helpers/role-validator.helper';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async registerClient(dto: RegisterClientDto): Promise<User> {
    const existing = await this.findOneByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already exists');

    console.log("dto: (IF THIS DOES NOT WORK, IMMMA KMS)", dto);

    const user = this.usersRepository.create({
      ...dto,
      role: 'cliente',
    });

    const saved = await this.usersRepository.save(user);
    const { password, ...result } = saved;
    return result as User;
  }

  async create(requester: User, dto: CreateUserDto): Promise<User> {
    RoleValidator.requireAdminPermission(requester.role);

    const existing = await this.findOneByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already exists');

    if (dto.role === 'manager' && !dto.storeId) {
      throw new BadRequestException('Manager must have a storeId assigned');
    }

    if (dto.storeId) {
      const store = await this.storeRepository.findOne({ where: { id: dto.storeId } });
      if (!store) throw new BadRequestException('Sucursal (store) not found');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepository.create({
      ...dto,
      password: hashedPassword,
    });

    const saved = await this.usersRepository.save(user);
    const { password, ...result } = saved;
    return result as User;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    const { password, ...result } = user;
    return result as User;
  }

  async update(requester: User, id: number, dto: UpdateUserDto): Promise<User> {
    RoleValidator.requireAdminPermission(requester.role);

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.role === 'manager' && !dto.storeId) {
      throw new BadRequestException('manager must have a storeId assigned');
    }

    await this.usersRepository.update(id, dto);
    return this.findOne(id);
  }

  async updateRole(requester: User, id: number, dto: UpdateUserRoleDto): Promise<User> {
    RoleValidator.requireAdminPermission(requester.role);

    if (dto.role === 'manager' && !dto.storeId) {
      throw new BadRequestException('manager must have a storeId assigned');
    }

    await this.usersRepository.update(id, {
      role: dto.role,
      storeId: dto.storeId,
    });

    return this.findOne(id);
  }

  async remove(requester: User, id: number): Promise<void> {
    RoleValidator.requireAdminPermission(requester.role);

    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async findAll(requester: User): Promise<User[]> {
    RoleValidator.requireUserManagementPermission(requester.role);

    const users = await this.usersRepository.find();
    return users.map(({ password, ...rest }) => rest as User);
  }

  async findByRole(requester: User, role: string): Promise<User[]> {
    RoleValidator.requireUserManagementPermission(requester.role);

    const users = await this.usersRepository.find({ where: { role } });
    return users.map(({ password, ...rest }) => rest as User);
  }

  async findBySucursal(requester: User, storeId: number): Promise<User[]> {
    RoleValidator.requireUserManagementPermission(requester.role);

    const users = await this.usersRepository.find({ where: { storeId } });
    return users.map(({ password, ...rest }) => rest as User);
  }
}