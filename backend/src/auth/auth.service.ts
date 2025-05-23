import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateOAuthLogin(profile: any, provider: string) {
    // Find or create user in DB
    let user = await this.prisma.user.findUnique({ where: { email: profile.email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          provider,
        },
      });
    }
    const payload = { sub: user.id, email: user.email, name: user.name };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }
}
