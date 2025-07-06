import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context)
    }

    //para extraer los datos del usuario a partir del JWT
    handleRequest(err, user) {
        if (err || !user) {
            throw err || new UnauthorizedException('Something is not working here...');
        }
        return user;
    }
}
