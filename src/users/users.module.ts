import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Store } from '../stores/store.entity/store.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Store])], // Assuming User entity is imported from the correct path
    controllers: [UsersController],
    providers: [UsersService],
    exports: [TypeOrmModule, UsersService], // Exporting TypeOrmModule and UsersService for use in other modules
})
export class UsersModule { }
