import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { Role } from './role.guard';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

export type Payload = {
  id: string;
  role: Role;
  instituteId: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(AuthService) private authService: AuthService,
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(JwtService) private jwt: JwtService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: jwtConstants.secret,
      // secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET_KEY')
    });
  }

  async validate(payload: Payload) {
    // console.log('we have entered this validation: ', payload);
    const role = payload.role;
    if (role != 'super-admin' && role != 'student' && role != 'teacher') {
      throw new UnauthorizedException();
    }
    let user;
    if (role == 'super-admin') {
      try {
        user = await this.prisma.admin.findUnique({
          where: {
            id: payload.id,
          },
        });
        if (!user) throw new UnauthorizedException('bitttch');
      } catch (error) {
        console.log(error);
        throw new UnauthorizedException('bitttch');
      }
    }
    if (role == 'student') {
      try {
        user = await this.prisma.student.findUnique({
          where: {
            id: payload.id,
          },
        });
        if (!user) throw new UnauthorizedException('biiitch');
      } catch (error) {
        throw new UnauthorizedException('bitttch');
      }
    }
    if (role == 'teacher') {
      try {
        user = await this.prisma.teacher.findUnique({
          where: {
            id: payload.id,
          },
        });
        if (!user) throw new UnauthorizedException('bitttch');
      } catch (error) {
        throw new UnauthorizedException('bitttch');
      }
    }

    return {
      id: payload.id,
      role: payload.role,
      instituteId: payload.instituteId,
    };
  }
}
