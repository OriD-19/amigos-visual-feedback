import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import "dotenv/config";

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET ?? 'secretKey',
            signOptions: { expiresIn: '1h' }, // Token expiration time
        }),
        UsersModule,
        PassportModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [JwtModule],
})
export class AuthModule { }
