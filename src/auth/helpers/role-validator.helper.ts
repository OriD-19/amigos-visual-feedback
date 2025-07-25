import { ForbiddenException } from '@nestjs/common';

export class RoleValidator {

  static canCreateComment(userRole: string): boolean {
    return userRole === 'cliente';
  }

  static canViewComments(userRole: string): boolean {
    return ['admin', 'manager'].includes(userRole);
  }

  static canModerateComments(userRole: string): boolean {
    return ['admin', 'manager'].includes(userRole);
  }

  static canViewAllUsers(userRole: string): boolean {
    return ['admin'].includes(userRole);
  }

  static canCreateUsers(userRole: string): boolean {
    return userRole === 'admin';
  }

  static canEditUsers(userRole: string): boolean {
    return userRole === 'admin';
  }

  static canDeleteUsers(userRole: string): boolean {
    return userRole === 'admin'; // Solo admins pueden eliminar
  }

  static canGenerateReports(userRole: string): boolean {
    return ['admin', 'manager'].includes(userRole);
  }

  static canViewSucursalReports(userRole: string): boolean {
    return ['admin', 'manager'].includes(userRole);
  }

  static requireModerationPermission(userRole: string): void {
    if (!this.canViewComments(userRole)) {
      throw new ForbiddenException('Only admins and managers can moderate content');
    }
  }

  static requireUserManagementPermission(userRole: string): void {
    if (!this.canViewAllUsers(userRole)) {
      throw new ForbiddenException('Only admins and managers can manage users');
    }
  }

  static requireReportPermission(userRole: string): void {
    if (!this.canGenerateReports(userRole)) {
      throw new ForbiddenException('Only admins and managers can generate reports');
    }
  }

  static requireAdminPermission(userRole: string): void {
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can perform this action');
    }
  }
}
