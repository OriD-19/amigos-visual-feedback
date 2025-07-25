import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService,
        private userService: UsersService) { }

    async validateUser(email: string, password: string): Promise<any> {

        const user = await this.userService.findOneByEmail(email);
        console.log("User found: ", user);


        if (!user) {
            return null;
        }

        const validationResult = await bcrypt.compare(password, user.password);
        if (!validationResult) {
            return null;
        }

        // Remove password from the user object before returning
        console.log("User found and password matched");
        const { password: _, ...safeUser } = user;
        console.log('User for login:', safeUser); // LOG
        return safeUser; 
    }

    async login(user: any) {
        console.log("user: ", user);
        const payload = {
            email: user.email,
            sub: user.id,
            name: user.name,
            role: user.role, 
        };
        console.log('Payload JWT:', payload); 
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }
}