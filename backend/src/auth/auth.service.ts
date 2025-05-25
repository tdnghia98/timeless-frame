import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { encrypt } from '@/lib/utils/crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateOAuthLogin(profile: any, provider: string) {
    // Find or create user in DB
    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          provider,
          refreshToken: profile.refreshToken
            ? encrypt(profile.refreshToken)
            : undefined, // Store encrypted refresh token
        },
      });
    } else {
      // Update refresh token if present
      if (profile.refreshToken) {
        user = await this.prisma.user.update({
          where: { email: profile.email },
          data: { refreshToken: encrypt(profile.refreshToken) },
        });
      }
    }
    const payload = { sub: user.email, email: user.email, name: user.name };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }
}
