import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

type Role = 'student' | 'admin' | 'teacher';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly requiredRole: Role) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const role = request.user.role;
    // Check if the user has the required role
    return role === this.requiredRole;
  }
}
