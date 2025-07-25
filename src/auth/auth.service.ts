import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RoleValidator } from '../auth/helpers/role-validator.helper';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService,
        private userService: UsersService) { }

    async validateUser(email: string, password: string): Promise<any> {

        const user = await this.userService.findOneByEmail(email);

        if (!user) {
            return null;
        }

        const validationResult = await bcrypt.compare(password, user.password);
        if (!validationResult) {
            return null;
        }

        // Remove password from the user object before returning
        const { password: _, ...safeUser } = user;
        return safeUser; 
    }

    async login(user: any) {
        const payload = {
            email: user.email,
            sub: user.id,
            userId: user.id,
            name: user.name,
            role: user.role, 
        };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }
}