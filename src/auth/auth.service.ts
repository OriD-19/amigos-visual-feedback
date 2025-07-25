import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);

        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return null;
        }

        return user;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, name: user.name };

        const { password, ...userWithoutPassword } = user;

        return {
            access_token: this.jwtService.sign(payload),
            user: userWithoutPassword,
        };
    }
}
