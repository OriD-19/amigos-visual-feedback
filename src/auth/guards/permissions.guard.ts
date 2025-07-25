import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolePermissions } from '../helpers/role-permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No se requiere permiso específico
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log('req.user en PermissionsGuard:', user); // LOG
    if (!user || !user.role) {
      throw new ForbiddenException('User not authenticated or role not defined');
    }

    const userPermissions = RolePermissions[user.role] || [];

    const hasAllPermissions = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('You do not have the necessary permissions');
    }

    return true;
  }
}